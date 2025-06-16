import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBusinessProfileSchema,
  insertCampaignSchema,
  insertInvestmentSchema,
  insertSafeAgreementSchema,
} from "@shared/schema";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pitchDeck') {
      cb(null, file.mimetype === 'application/pdf');
    } else if (file.fieldname === 'logo') {
      cb(null, file.mimetype.startsWith('image/'));
    } else {
      cb(null, true);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Business profile routes
  app.post('/api/business-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/business-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getBusinessProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ message: "Failed to fetch business profile" });
    }
  });

  // Campaign routes
  app.post('/api/campaigns', isAuthenticated, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'pitchDeck', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const founderId = req.user.claims.sub;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Generate unique private link
      const privateLink = nanoid(16);
      
      const campaignData = {
        ...req.body,
        founderId,
        privateLink,
        logoUrl: files.logo?.[0]?.path,
        pitchDeckUrl: files.pitchDeck?.[0]?.path,
      };

      const data = insertCampaignSchema.parse(campaignData);
      const campaign = await storage.createCampaign({ ...data, privateLink });
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.get('/api/campaigns/founder/:founderId', isAuthenticated, async (req: any, res) => {
    try {
      const { founderId } = req.params;
      const userId = req.user.claims.sub;
      
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
      const campaign = await storage.getCampaign(parseInt(id));
      
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

  app.put('/api/campaigns/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
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
  app.post('/api/investments', isAuthenticated, async (req: any, res) => {
    try {
      const investorId = req.user.claims.sub;
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

  app.get('/api/investments/investor/:investorId', isAuthenticated, async (req: any, res) => {
    try {
      const { investorId } = req.params;
      const userId = req.user.claims.sub;
      
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

  app.get('/api/investments/campaign/:campaignId', isAuthenticated, async (req: any, res) => {
    try {
      const { campaignId } = req.params;
      const investments = await storage.getInvestmentsByCampaign(parseInt(campaignId));
      res.json(investments);
    } catch (error) {
      console.error("Error fetching campaign investments:", error);
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.put('/api/investments/:id/sign', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { signature } = req.body;
      const userId = req.user.claims.sub;
      
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
  app.get('/api/analytics/founder/:founderId', isAuthenticated, async (req: any, res) => {
    try {
      const { founderId } = req.params;
      const userId = req.user.claims.sub;
      
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

  app.get('/api/analytics/investor/:investorId', isAuthenticated, async (req: any, res) => {
    try {
      const { investorId } = req.params;
      const userId = req.user.claims.sub;
      
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

  const httpServer = createServer(app);
  return httpServer;
}
