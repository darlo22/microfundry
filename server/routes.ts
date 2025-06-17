import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, hashPassword, comparePasswords } from "./auth";
import { isAuthenticated } from "./replitAuth";
import { 
  insertBusinessProfileSchema,
  insertCampaignSchema,
  insertInvestmentSchema,
  insertSafeAgreementSchema,
} from "@shared/schema";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";

// Simple in-memory store for KYC submissions (in production, this would be in database)
const kycSubmissions = new Map<string, any>();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pitchDeck') {
      cb(null, file.mimetype === 'application/pdf');
    } else if (file.fieldname === 'logo' || file.fieldname.startsWith('teamMemberPhoto_')) {
      cb(null, file.mimetype.startsWith('image/'));
    } else {
      cb(null, true);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically from uploads directory
  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: 'File not found' });
      }
    });
  });
  
  // Auth middleware
  setupAuth(app);

  // Business profile routes
  app.post('/api/business-profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = insertBusinessProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const profile = await storage.createBusinessProfile(data);
      res.json(profile);
    } catch (error) {
      console.error("Error creating business profile:", error);
      res.status(500).json({ message: "Failed to create business profile" });
    }
  });

  app.get('/api/business-profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getBusinessProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ message: "Failed to fetch business profile" });
    }
  });

  // Update user profile
  app.put('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      // Get existing user to preserve required fields
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Parse date of birth if provided
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }
      
      // Update user profile data while preserving required fields
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: existingUser.email,
        userType: existingUser.userType, // Preserve existing user type
        ...updateData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Update business profile
  app.put('/api/business-profile/:userId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const updateData = req.body;
      
      // Ensure user can only update their own profile
      if (userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      
      const updatedProfile = await storage.updateBusinessProfile(userId, updateData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating business profile:", error);
      res.status(500).json({ message: "Failed to update business profile" });
    }
  });

  // Update notification preferences (placeholder endpoint)
  app.put('/api/user/notifications', requireAuth, async (req: any, res) => {
    try {
      // For now, just return success since we don't have notifications table
      // In a real implementation, this would update notification preferences in the database
      res.json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Change password endpoint
  app.put('/api/user/change-password', requireAuth, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Get current user to verify password
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await comparePasswords(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.upsertUser({
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        password: hashedNewPassword,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        country: user.country,
        state: user.state,
        bio: user.bio,
      });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Toggle 2FA endpoint
  app.put('/api/user/2fa', requireAuth, async (req: any, res) => {
    try {
      const { enabled } = req.body;
      const userId = req.user.id;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Enabled flag must be a boolean" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For now, we'll just simulate 2FA toggle since we don't have 2FA fields in the database
      // In a real implementation, this would update 2FA settings in the user profile
      
      res.json({ 
        message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        twoFactorEnabled: enabled 
      });
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      res.status(500).json({ message: "Failed to update two-factor authentication" });
    }
  });

  // Payment withdrawal endpoints
  app.get('/api/withdrawal-info/:userId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      
      // Ensure user can only access their own withdrawal info
      if (userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this information" });
      }

      // Get user's investment data to calculate balances
      const investments = await storage.getInvestmentsByInvestor(userId);
      const userFounderStats = await storage.getFounderStats(userId);
      
      // Calculate available balance from successful investments as founder
      const availableBalance = parseFloat(userFounderStats.totalRaised) * 0.95; // 5% platform fee
      const pendingWithdrawals = 0; // Would track pending withdrawal requests
      const totalEarnings = parseFloat(userFounderStats.totalRaised);

      res.json({
        availableBalance: availableBalance.toFixed(2),
        pendingWithdrawals: pendingWithdrawals.toFixed(2),
        totalEarnings: totalEarnings.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching withdrawal info:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal information" });
    }
  });

  app.post('/api/withdrawal-request', requireAuth, async (req: any, res) => {
    try {
      const { 
        amount, 
        country,
        bankAccount, 
        routingNumber, 
        swiftCode, 
        iban, 
        sortCode, 
        bsb, 
        transitNumber, 
        bankName, 
        bankAddress,
        accountType, 
        memo 
      } = req.body;
      const userId = req.user.id;

      if (!amount || !country || !bankAccount) {
        return res.status(400).json({ message: "Amount, country, and bank account are required" });
      }

      // Validate withdrawal amount against available balance
      const userFounderStats = await storage.getFounderStats(userId);
      const availableBalance = parseFloat(userFounderStats.totalRaised) * 0.95;
      
      if (parseFloat(amount) > availableBalance) {
        return res.status(400).json({ message: "Insufficient funds for withdrawal" });
      }

      // In a real implementation, this would create a withdrawal request record
      // For now, we'll simulate the process
      
      res.json({ 
        message: "Withdrawal request submitted successfully",
        withdrawalId: Date.now().toString(),
        amount,
        status: "pending"
      });
    } catch (error) {
      console.error("Error processing withdrawal request:", error);
      res.status(500).json({ message: "Failed to process withdrawal request" });
    }
  });

  app.get('/api/transactions/:userId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      
      // Ensure user can only access their own transactions
      if (userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this information" });
      }

      // Get user's investments and create transaction history
      const investments = await storage.getInvestmentsByInvestor(userId);
      const campaigns = await storage.getCampaignsByFounder(userId);
      
      const transactions = [];

      // Add investment transactions
      for (const investment of investments) {
        if (investment.status === 'committed' || investment.status === 'paid') {
          transactions.push({
            type: 'investment',
            description: `Investment in Campaign #${investment.campaignId}`,
            amount: investment.amount,
            date: investment.createdAt,
            status: 'completed'
          });
        }
      }

      // Add funding received transactions for founders
      for (const campaign of campaigns) {
        const campaignInvestments = await storage.getInvestmentsByCampaign(campaign.id);
        const totalRaised = campaignInvestments
          .filter(inv => inv.status === 'committed' || inv.status === 'paid')
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        
        if (totalRaised > 0) {
          transactions.push({
            type: 'funding',
            description: `Funding received for ${campaign.title}`,
            amount: totalRaised.toFixed(2),
            date: campaign.createdAt,
            status: 'completed'
          });
        }
      }

      // Sort by date (most recent first)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json(transactions.slice(0, 10)); // Return last 10 transactions
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // KYC endpoints
  app.get('/api/kyc-status/:userId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      
      // Ensure user can only access their own KYC status
      if (userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this information" });
      }

      // In a real implementation, this would fetch KYC status from database
      // For now, we'll simulate based on user profile completeness
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has submitted KYC data
      const kycSubmission = kycSubmissions.get(userId);
      
      let status = "not_started";
      let lastUpdated = null;
      let completionPercentage = 0;

      if (kycSubmission) {
        status = kycSubmission.status;
        lastUpdated = kycSubmission.submittedAt;
        completionPercentage = status === "verified" ? 100 : (status === "pending" || status === "under_review") ? 85 : 0;
      }

      res.json({
        status,
        lastUpdated,
        completionPercentage,
        submittedData: kycSubmission?.data || null
      });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  app.post('/api/kyc-submit', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const kycData = req.body;

      console.log('KYC Data received:', kycData); // Debug log

      // Validate required KYC fields
      const requiredFields = ['dateOfBirth', 'ssn', 'address', 'city', 'state', 'zipCode', 'employmentStatus', 'annualIncome', 'investmentExperience', 'riskTolerance'];
      
      for (const field of requiredFields) {
        if (!kycData[field] || (typeof kycData[field] === 'string' && kycData[field].trim() === '')) {
          return res.status(400).json({ message: `${field} is required` });
        }
      }

      // Store KYC submission in memory (in production, this would be in database)
      kycSubmissions.set(userId, {
        status: "under_review",
        submittedAt: new Date(),
        data: kycData
      });

      // Store KYC data and update status to "Under Review"
      await storage.updateUserKycStatus(userId, {
        status: "pending",
        submittedAt: new Date(),
        data: kycData
      });

      res.json({ 
        message: "KYC information submitted successfully",
        status: "under_review",
        submittedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ message: "Failed to submit KYC information" });
    }
  });

  // Campaign routes
  app.put('/api/campaigns/:id', requireAuth, upload.any(), async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      if (campaign.founderId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to edit this campaign' });
      }

      const files = req.files as Express.Multer.File[];
      const updateData: any = { ...req.body };

      // Handle logo file
      const logoFile = files.find(file => file.fieldname === 'logo');
      if (logoFile) {
        // Check file size (2MB limit)
        if (logoFile.size > 2 * 1024 * 1024) {
          return res.status(400).json({ message: 'Logo file size must be under 2MB' });
        }
        updateData.logoUrl = `/uploads/${logoFile.filename}`;
      }

      // Handle pitch deck file
      const pitchDeckFile = files.find(file => file.fieldname === 'pitchDeck');
      if (pitchDeckFile) {
        updateData.pitchDeckUrl = `/uploads/${pitchDeckFile.filename}`;
      }

      // Handle team member photos and update teamMembers JSON
      if (updateData.teamMembers) {
        try {
          const teamMembers = JSON.parse(updateData.teamMembers);
          console.log('Processing team members:', teamMembers);
          console.log('Available files:', files.map(f => ({ fieldname: f.fieldname, filename: f.filename })));
          
          // Process team member photos
          teamMembers.forEach((member: any) => {
            const photoFile = files.find(file => file.fieldname === `teamMemberPhoto_${member.id}`);
            console.log(`Processing member ${member.id}:`, { 
              hasPhotoFile: !!photoFile, 
              currentPhoto: member.photo, 
              currentPhotoUrl: member.photoUrl 
            });
            
            if (photoFile) {
              // Check file size (2MB limit)
              if (photoFile.size > 2 * 1024 * 1024) {
                throw new Error(`Team member photo for ${member.name || member.id} must be under 2MB`);
              }
              member.photoUrl = `/uploads/${photoFile.filename}`;
              console.log(`Set new photoUrl for ${member.id}:`, member.photoUrl);
              // Remove the File object reference
              delete member.photo;
            } else if (member.photo && typeof member.photo === 'string' && member.photo.startsWith('/uploads/')) {
              // Preserve existing photoUrl if no new photo uploaded
              member.photoUrl = member.photo;
              delete member.photo;
              console.log(`Preserved existing photoUrl for ${member.id}:`, member.photoUrl);
            } else if (member.photoUrl) {
              // Keep existing photoUrl intact
              delete member.photo;
              console.log(`Kept existing photoUrl for ${member.id}:`, member.photoUrl);
            }
          });
          
          updateData.teamMembers = JSON.stringify(teamMembers);
          console.log('Final team members data:', updateData.teamMembers);
        } catch (e) {
          console.error('Error processing team members:', e);
        }
      }

      const updatedCampaign = await storage.updateCampaign(campaignId, updateData);
      res.json(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ message: 'Failed to update campaign' });
    }
  });

  app.post('/api/campaigns', requireAuth, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'pitchDeck', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const founderId = req.user.id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Generate unique private link
      const privateLink = nanoid(16);
      
      // Validate file sizes (2MB limit)
      if (files.logo?.[0] && files.logo[0].size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: 'Logo file size must be under 2MB' });
      }

      const campaignData = {
        ...req.body,
        founderId,
        status: "active", // Set status to active so it appears in browse page
        logoUrl: files.logo?.[0]?.path,
        pitchDeckUrl: files.pitchDeck?.[0]?.path,
        // Convert deadline string to Date object if provided
        deadline: req.body.deadline ? new Date(req.body.deadline) : null,
        // Handle JSON fields
        teamMembers: req.body.teamMembers ? JSON.parse(req.body.teamMembers) : null,
        useOfFunds: req.body.useOfFunds ? JSON.parse(req.body.useOfFunds) : null,
      };

      const validatedData = insertCampaignSchema.parse(campaignData);
      const campaign = await storage.createCampaign(validatedData, privateLink);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Get all active campaigns for browse page
  app.get('/api/campaigns', async (req, res) => {
    try {
      const campaigns = await storage.getAllActiveCampaigns();
      
      // Add stats to each campaign
      const campaignsWithStats = await Promise.all(
        campaigns.map(async (campaign) => {
          const stats = await storage.getCampaignStats(campaign.id);
          return { ...campaign, ...stats };
        })
      );
      
      res.json(campaignsWithStats);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/founder/:founderId', requireAuth, async (req: any, res) => {
    try {
      const { founderId } = req.params;
      const userId = req.user.id;
      
      // Ensure user can only access their own campaigns
      if (founderId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const campaigns = await storage.getCampaignsByFounder(founderId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const campaignId = parseInt(id);
      
      // Validate that id is a valid number
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const stats = await storage.getCampaignStats(campaign.id);
      res.json({ ...campaign, ...stats });
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.get('/api/campaigns/link/:privateLink', async (req, res) => {
    try {
      const { privateLink } = req.params;
      const campaign = await storage.getCampaignByPrivateLink(privateLink);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      const stats = await storage.getCampaignStats(campaign.id);
      res.json({ ...campaign, ...stats });
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.put('/api/campaigns/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const campaign = await storage.getCampaign(parseInt(id));
      if (!campaign || campaign.founderId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedCampaign = await storage.updateCampaign(parseInt(id), req.body);
      res.json(updatedCampaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Investment routes
  app.post('/api/investments', requireAuth, async (req: any, res) => {
    try {
      const investorId = req.user.id;
      const { campaignId, amount } = req.body;
      
      const platformFee = Math.round(amount * 0.025 * 100) / 100;
      const totalAmount = amount + platformFee;
      
      const investmentData = {
        campaignId: parseInt(campaignId),
        investorId,
        amount: amount.toString(),
        platformFee: platformFee.toString(),
        totalAmount: totalAmount.toString(),
        status: "pending",
        paymentStatus: "pending",
        ipAddress: req.ip,
      };

      const data = insertInvestmentSchema.parse(investmentData);
      const investment = await storage.createInvestment(data);
      
      // Generate SAFE agreement
      const agreementId = `SAFE-${nanoid(8)}`;
      const safeData = {
        investmentId: investment.id,
        agreementId,
        terms: {
          discountRate: "20",
          valuationCap: "1000000",
        },
        status: "draft",
      };
      
      const safeAgreement = await storage.createSafeAgreement(safeData);
      
      res.json({ investment, safeAgreement });
    } catch (error) {
      console.error("Error creating investment:", error);
      res.status(500).json({ message: "Failed to create investment" });
    }
  });

  app.get('/api/investments/investor/:investorId', requireAuth, async (req: any, res) => {
    try {
      const { investorId } = req.params;
      const userId = req.user.id;
      
      if (investorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const investments = await storage.getInvestmentsByInvestor(investorId);
      res.json(investments);
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.get('/api/investments/campaign/:campaignId', requireAuth, async (req: any, res) => {
    try {
      const { campaignId } = req.params;
      const investments = await storage.getInvestmentsByCampaign(parseInt(campaignId));
      res.json(investments);
    } catch (error) {
      console.error("Error fetching campaign investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.put('/api/investments/:id/sign', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { signature } = req.body;
      const userId = req.user.id;
      
      const investment = await storage.getInvestment(parseInt(id));
      if (!investment || investment.investorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update investment with signature
      await storage.updateInvestment(parseInt(id), {
        agreementSigned: true,
        signedAt: new Date(),
      });
      
      // Update SAFE agreement
      const safeAgreement = await storage.getSafeAgreement(parseInt(id));
      if (safeAgreement) {
        await storage.updateSafeAgreement(safeAgreement.id, {
          investorSignature: signature,
          signedAt: new Date(),
          status: "signed",
        });
      }
      
      res.json({ message: "Investment signed successfully" });
    } catch (error) {
      console.error("Error signing investment:", error);
      res.status(500).json({ message: "Failed to sign investment" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/founder/:founderId', requireAuth, async (req: any, res) => {
    try {
      const { founderId } = req.params;
      const userId = req.user.id;
      
      if (founderId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getFounderStats(founderId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching founder stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/analytics/investor/:investorId', requireAuth, async (req: any, res) => {
    try {
      const { investorId } = req.params;
      const userId = req.user.id;
      
      if (investorId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getInvestorStats(investorId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching investor stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Seed sample campaigns for demo purposes
  app.post('/api/seed-campaigns', async (req, res) => {
    try {
      const sampleCampaigns = [
        {
          title: "GreenTech Solutions",
          shortPitch: "Revolutionizing renewable energy storage with advanced battery technology",
          fullPitch: "Our proprietary battery technology uses revolutionary lithium-silicon compounds to achieve 3x energy density compared to traditional batteries. We're targeting the growing renewable energy storage market, which is expected to reach $120B by 2026. Our team includes former Tesla engineers and we have preliminary partnerships with major solar installers.",
          fundingGoal: "250000",
          minimumInvestment: "25",
          status: "active",
          discountRate: "20",
          valuationCap: "5000000",
          privateLink: "greentech-2024",
          founderId: "demo-founder-1",
          deadline: "2025-07-15"
        },
        {
          title: "HealthAI Platform", 
          shortPitch: "AI-powered diagnostics for early disease detection in primary care",
          fullPitch: "Our AI platform analyzes medical data including lab results, imaging, and patient history to detect early signs of diseases like diabetes, heart disease, and cancer. We've achieved 94% accuracy in clinical trials and are partnered with 15 medical centers. The global AI healthcare market is projected to reach $148B by 2029.",
          fundingGoal: "500000",
          minimumInvestment: "50",
          status: "active", 
          discountRate: "15",
          valuationCap: "8000000",
          privateLink: "healthai-series-a",
          founderId: "demo-founder-2",
          deadline: "2025-08-30"
        },
        {
          title: "EduSpace",
          shortPitch: "Virtual reality learning environments for immersive education",
          fullPitch: "EduSpace creates virtual classrooms that transport students to ancient Rome, inside the human body, or to distant planets. Our VR education platform increases student engagement by 85% and retention by 67% compared to traditional methods. We're working with 50+ schools and have content partnerships with National Geographic and Discovery.",
          fundingGoal: "150000", 
          minimumInvestment: "25",
          status: "active",
          discountRate: "25", 
          valuationCap: "3000000",
          privateLink: "eduspace-vr",
          founderId: "demo-founder-3",
          deadline: "2025-06-20"
        }
      ];

      const createdCampaigns = [];
      for (const campaignData of sampleCampaigns) {
        try {
          const { privateLink, ...dataWithoutPrivateLink } = campaignData as any;
          const data = insertCampaignSchema.parse(dataWithoutPrivateLink);
          const campaign = await storage.createCampaign(data, privateLink);
          createdCampaigns.push(campaign);
        } catch (error) {
          console.log(`Campaign ${campaignData.title} may already exist, skipping...`);
        }
      }

      res.json({ 
        message: "Sample campaigns seeded successfully",
        campaigns: createdCampaigns
      });
    } catch (error) {
      console.error("Error seeding campaigns:", error);
      res.status(500).json({ message: "Failed to seed campaigns" });
    }
  });

  // Get investments for founder's campaigns
  app.get('/api/investments/founder/:founderId', requireAuth, async (req: any, res) => {
    try {
      const founderId = req.params.founderId;
      
      if (founderId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Get all campaigns for the founder first
      const campaigns = await storage.getCampaignsByFounder(founderId);
      const campaignIds = campaigns.map(c => c.id);
      
      // Get all investments for these campaigns
      const allInvestments = [];
      for (const campaignId of campaignIds) {
        const investments = await storage.getInvestmentsByCampaign(campaignId);
        allInvestments.push(...investments);
      }
      
      res.json(allInvestments);
    } catch (error) {
      console.error('Error fetching founder investments:', error);
      res.status(500).json({ message: 'Failed to fetch investments' });
    }
  });

  // Campaign updates endpoints
  app.post('/api/campaign-updates', requireAuth, async (req: any, res) => {
    try {
      const founderId = req.user.id;
      const { campaignId, title, content, type } = req.body;
      
      // Verify campaign ownership
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign || campaign.founderId !== founderId) {
        return res.status(403).json({ message: 'Not authorized to update this campaign' });
      }

      const updateData = {
        campaignId: parseInt(campaignId),
        title,
        content,
        type,
      };

      const update = await storage.createCampaignUpdate(updateData);
      res.json(update);
    } catch (error) {
      console.error('Error creating campaign update:', error);
      res.status(500).json({ message: 'Failed to create update' });
    }
  });

  app.get('/api/campaign-updates/founder/:founderId', requireAuth, async (req: any, res) => {
    try {
      const founderId = req.params.founderId;
      
      if (founderId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Get all campaigns for the founder
      const campaigns = await storage.getCampaignsByFounder(founderId);
      const campaignIds = campaigns.map(c => c.id);
      
      // Get all updates for these campaigns
      const allUpdates = [];
      for (const campaignId of campaignIds) {
        const updates = await storage.getCampaignUpdates(campaignId);
        // Add campaign title to each update
        const updatesWithCampaign = updates.map(update => ({
          ...update,
          campaign: { title: campaigns.find(c => c.id === campaignId)?.title || 'Unknown Campaign' }
        }));
        allUpdates.push(...updatesWithCampaign);
      }
      
      // Sort by creation date, newest first
      allUpdates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allUpdates);
    } catch (error) {
      console.error('Error fetching founder updates:', error);
      res.status(500).json({ message: 'Failed to fetch updates' });
    }
  });

  app.put('/api/campaign-updates/:id', requireAuth, async (req: any, res) => {
    try {
      const updateId = parseInt(req.params.id);
      const founderId = req.user.id;
      const { title, content, type } = req.body;
      
      // For now, just return success (would need to implement update logic)
      res.json({ id: updateId, title, content, type, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating campaign update:', error);
      res.status(500).json({ message: 'Failed to update' });
    }
  });

  app.delete('/api/campaign-updates/:id', requireAuth, async (req: any, res) => {
    try {
      const updateId = parseInt(req.params.id);
      
      // For now, just return success (would need to implement delete logic)
      res.json({ message: 'Update deleted successfully' });
    } catch (error) {
      console.error('Error deleting campaign update:', error);
      res.status(500).json({ message: 'Failed to delete update' });
    }
  });

  // Download SAFE agreement endpoint
  app.get('/api/investments/:investmentId/safe-agreement', requireAuth, async (req: any, res) => {
    try {
      const investmentId = parseInt(req.params.investmentId);
      const userId = req.user.id;
      
      // Get the investment to verify ownership and get details
      const investment = await storage.getInvestment(investmentId);
      if (!investment) {
        return res.status(404).json({ message: 'Investment not found' });
      }
      
      // Verify the user owns this investment
      if (investment.investorId !== userId) {
        return res.status(403).json({ message: 'Not authorized to access this investment' });
      }
      
      // Get campaign details for the SAFE agreement
      const campaign = await storage.getCampaign(investment.campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      // Get investor details
      const investor = await storage.getUser(userId);
      if (!investor) {
        return res.status(404).json({ message: 'Investor not found' });
      }
      
      // Generate SAFE agreement content
      const safeContent = `
SAFE AGREEMENT

INVESTMENT DETAILS:
- Investment Amount: $${investment.amount}
- Investment Date: ${new Date(investment.createdAt).toLocaleDateString()}
- Campaign: ${campaign.title}
- Discount Rate: ${campaign.discountRate || 20}%
- Valuation Cap: $${campaign.valuationCap || 1000000}

INVESTOR INFORMATION:
- Name: ${investor.firstName} ${investor.lastName}
- Email: ${investor.email}
- Investment ID: ${investment.id}

COMPANY INFORMATION:
- Company: ${campaign.title}
- Founder ID: ${campaign.founderId}

This SAFE (Simple Agreement for Future Equity) represents an investment in ${campaign.title}.
The investor will receive equity when the company raises its next qualifying round.

Terms:
- Discount Rate: ${campaign.discountRate || 20}%
- Valuation Cap: $${campaign.valuationCap || 1000000}
- Investment Amount: $${investment.amount}

Generated on: ${new Date().toLocaleDateString()}
      `;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="SAFE_Agreement_${campaign.title.replace(/\s+/g, '_')}_${investmentId}.txt"`);
      
      // For now, return as text. In production, you'd generate a proper PDF
      res.send(safeContent);
      
    } catch (error) {
      console.error('Error generating SAFE agreement:', error);
      res.status(500).json({ message: 'Failed to generate SAFE agreement' });
    }
  });

  // Investor messages endpoint with file attachment support
  const messageUpload = multer({
    dest: 'uploads/message-attachments/',
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type') as any, false);
      }
    }
  });

  app.post('/api/investor-messages', requireAuth, messageUpload.any(), async (req: any, res) => {
    try {
      const founderId = req.user.id;
      const { subject, content, messageType } = req.body;
      let recipients;
      
      // Parse recipients JSON string
      try {
        recipients = JSON.parse(req.body.recipients || '[]');
      } catch (e) {
        recipients = [];
      }
      
      // Validate required fields
      if (!subject || !content || !recipients || recipients.length === 0) {
        return res.status(400).json({ message: 'Subject, content, and recipients are required' });
      }

      // Process file attachments
      const attachments = req.files ? req.files.map((file: any) => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      })) : [];

      // In a real implementation, you would:
      // 1. Save the message to the database
      // 2. Send emails to the recipients with attachments
      // 3. Track delivery status
      
      // For now, simulate successful sending
      const messageRecord = {
        id: Date.now(),
        founderId,
        subject,
        content,
        messageType,
        recipients: Array.isArray(recipients) ? recipients : [recipients],
        attachments,
        sentAt: new Date(),
        status: 'sent'
      };

      console.log('Message sent to investors:', {
        subject,
        messageType,
        recipientCount: Array.isArray(recipients) ? recipients.length : 1,
        attachmentCount: attachments.length
      });

      res.json({ 
        message: 'Message sent successfully',
        data: messageRecord
      });
    } catch (error) {
      console.error('Error sending investor message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Catch-all handler for client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    
    // For all other routes, serve the React app
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    } else {
      // In development, Vite handles this
      next();
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
