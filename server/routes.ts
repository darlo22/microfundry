import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, hashPassword, comparePasswords } from "./auth";
import { isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { 
  insertBusinessProfileSchema,
  insertCampaignSchema,
  insertInvestmentSchema,
  insertSafeAgreementSchema,
} from "@shared/schema";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import { TwoFactorService } from "./twoFactorService";
import { emailService } from "./services/email";
import { eq, and, gt } from "drizzle-orm";
import { emailVerificationTokens } from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  // 2FA Setup Routes
  
  // Initialize 2FA setup - generate secret and QR code for authenticator apps
  app.post('/api/2fa/setup/app', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const email = req.user.email;

      // Generate TOTP secret and QR code
      const { secret, qrCodeUrl } = TwoFactorService.generateTOTPSecret(email);
      const qrCodeImage = await TwoFactorService.generateQRCodeImage(qrCodeUrl);

      res.json({
        secret,
        qrCodeImage,
        manualEntryKey: secret,
      });
    } catch (error) {
      console.error("Error setting up app-based 2FA:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  // Verify and enable app-based 2FA
  app.post('/api/2fa/verify-setup/app', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { secret, token } = req.body;

      if (!secret || !token) {
        return res.status(400).json({ message: "Secret and verification code are required" });
      }

      // Verify the TOTP code
      const isValid = TwoFactorService.verifyTOTPCode(secret, token);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Enable 2FA for the user
      await TwoFactorService.enable2FA(userId, 'app', secret);

      // Generate backup codes
      const user = await storage.getUser(userId);
      const backupCodes = user?.twoFactorBackupCodes as string[];

      res.json({
        message: "2FA enabled successfully",
        backupCodes,
      });
    } catch (error) {
      console.error("Error verifying app-based 2FA setup:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });

  // Setup email-based 2FA
  app.post('/api/2fa/setup/email', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const email = req.user.email;

      // Generate and send email OTP
      const code = TwoFactorService.generateEmailOTP();
      await TwoFactorService.storeEmailOTP(userId, code, 'email_2fa');
      await TwoFactorService.sendEmailOTP(email, code, '2FA Setup');

      res.json({
        message: "Verification code sent to your email",
      });
    } catch (error) {
      console.error("Error setting up email-based 2FA:", error);
      res.status(500).json({ message: "Failed to setup email 2FA" });
    }
  });

  // Verify and enable email-based 2FA
  app.post('/api/2fa/verify-setup/email', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Verification code is required" });
      }

      // Verify the email OTP
      const isValid = await TwoFactorService.verifyEmailOTP(userId, code, 'email_2fa');
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      // Enable 2FA for the user
      await TwoFactorService.enable2FA(userId, 'email');

      // Generate backup codes
      const user = await storage.getUser(userId);
      const backupCodes = user?.twoFactorBackupCodes as string[];

      res.json({
        message: "Email 2FA enabled successfully",
        backupCodes,
      });
    } catch (error) {
      console.error("Error verifying email-based 2FA setup:", error);
      res.status(500).json({ message: "Failed to enable email 2FA" });
    }
  });

  // 2FA Authentication Routes (for login flow)
  
  // Send 2FA challenge based on user's preferred method
  app.post('/api/2fa/challenge', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA not enabled for this user" });
      }

      const method = user.twoFactorMethod;
      
      if (method === 'email') {
        // Send email OTP
        const code = TwoFactorService.generateEmailOTP();
        await TwoFactorService.storeEmailOTP(userId, code, 'email_2fa');
        await TwoFactorService.sendEmailOTP(user.email, code, '2FA Login');
        
        res.json({
          method: 'email',
          message: "Verification code sent to your email",
        });
      } else if (method === 'app') {
        res.json({
          method: 'app',
          message: "Enter the code from your authenticator app",
        });
      } else {
        res.status(400).json({ message: "Unknown 2FA method" });
      }
    } catch (error) {
      console.error("Error sending 2FA challenge:", error);
      res.status(500).json({ message: "Failed to send 2FA challenge" });
    }
  });

  // Verify 2FA code during login
  app.post('/api/2fa/verify', async (req, res) => {
    try {
      const { userId, code, method } = req.body;

      if (!userId || !code) {
        return res.status(400).json({ message: "User ID and verification code are required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA not enabled for this user" });
      }

      let isValid = false;

      if (method === 'app' && user.twoFactorSecret) {
        // Verify TOTP code
        isValid = TwoFactorService.verifyTOTPCode(user.twoFactorSecret, code);
      } else if (method === 'email') {
        // Verify email OTP
        isValid = await TwoFactorService.verifyEmailOTP(userId, code, 'email_2fa');
      } else if (method === 'backup') {
        // Verify backup code
        isValid = await TwoFactorService.verifyBackupCode(userId, code);
      }

      if (!isValid) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      res.json({
        success: true,
        message: "2FA verification successful",
      });
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      res.status(500).json({ message: "Failed to verify 2FA code" });
    }
  });

  // 2FA Management Routes
  
  // Get 2FA status
  app.get('/api/2fa/status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      res.json({
        enabled: user?.twoFactorEnabled || false,
        method: user?.twoFactorMethod || null,
        backupCodesCount: (user?.twoFactorBackupCodes as string[] || []).length,
      });
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });

  // Disable 2FA
  app.post('/api/2fa/disable', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required to disable 2FA" });
      }

      // Verify user's password
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ message: "User not found" });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Disable 2FA
      await TwoFactorService.disable2FA(userId);

      res.json({
        message: "2FA disabled successfully",
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // Generate new backup codes
  app.post('/api/2fa/backup-codes/regenerate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required to regenerate backup codes" });
      }

      // Verify user's password
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ message: "User not found" });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      if (!user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }

      // Generate new backup codes
      const newBackupCodes = TwoFactorService.generateBackupCodes();
      await storage.updateUserBackupCodes(userId, newBackupCodes);

      res.json({
        backupCodes: newBackupCodes,
        message: "New backup codes generated",
      });
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      res.status(500).json({ message: "Failed to regenerate backup codes" });
    }
  });

  // Email Verification Routes
  
  // Send verification email
  app.post('/api/send-verification-email', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate verification token
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete any existing tokens for this user
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));

      // Store verification token
      await db.insert(emailVerificationTokens).values({
        id: nanoid(),
        userId,
        token,
        expiresAt,
      });

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(user.email, token, user.firstName);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Verify email with token (server endpoint)
  app.get('/api/verify-email', async (req, res) => {
    // Set headers to prevent browser blocking
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #dc2626;">Invalid Verification Link</h1>
              <p>This verification link is invalid or malformed.</p>
              <a href="/" style="color: #f97316;">Return to Fundry</a>
            </body>
          </html>
        `);
      }

      // Find verification token
      const verificationToken = await db.select()
        .from(emailVerificationTokens)
        .where(and(
          eq(emailVerificationTokens.token, token),
          gt(emailVerificationTokens.expiresAt, new Date())
        ))
        .limit(1);

      if (verificationToken.length === 0) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #dc2626;">Verification Link Expired</h1>
              <p>This verification link has expired or is invalid.</p>
              <p>Please request a new verification email.</p>
              <a href="/" style="color: #f97316;">Return to Fundry</a>
            </body>
          </html>
        `);
      }

      const tokenData = verificationToken[0];

      // Get user and verify email
      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        return res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #dc2626;">User Not Found</h1>
              <p>The user associated with this verification link was not found.</p>
              <a href="/" style="color: #f97316;">Return to Fundry</a>
            </body>
          </html>
        `);
      }

      if (user.isEmailVerified) {
        return res.status(200).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #059669;">Email Already Verified</h1>
              <p>Your email address has already been verified.</p>
              <a href="/signin" style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">Sign In</a>
            </body>
          </html>
        `);
      }

      // Update user's email verification status
      await storage.updateUser(tokenData.userId, { isEmailVerified: true });

      // Delete the used token
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, tokenData.id));

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName, user.userType);

      // Return success page
      const dashboardUrl = user.userType === 'founder' ? '/founder-dashboard' : '/investor-dashboard';
      res.status(200).send(`
        <html>
          <head>
            <title>Email Verified - Fundry</title>
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1 style="color: #059669;">Email Verified Successfully!</h1>
              <p style="font-size: 18px; margin: 20px 0;">Welcome to Fundry, ${user.firstName}!</p>
              <p>Your email has been verified and your account is now active. You can now sign in and start using the platform.</p>
              <div style="margin: 30px 0;">
                <a href="/signin" style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 10px;">Sign In Now</a>
                <a href="/" style="display: inline-block; padding: 12px 24px; border: 2px solid #f97316; color: #f97316; text-decoration: none; border-radius: 6px; margin: 10px;">Return to Home</a>
              </div>
              <p style="color: #666; font-size: 14px;">© 2025 Fundry. All rights reserved.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Verification Error</h1>
            <p>An error occurred while verifying your email. Please try again later.</p>
            <a href="/" style="color: #f97316;">Return to Fundry</a>
          </body>
        </html>
      `);
    }
  });

  // Resend verification email
  app.post('/api/resend-verification-email', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete any existing tokens for this user
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, user.id));

      // Store new verification token
      await db.insert(emailVerificationTokens).values({
        id: nanoid(),
        userId: user.id,
        token,
        expiresAt,
      });

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(user.email, token, user.firstName);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email. Please check your email address and try again." });
      }

      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Error resending verification email:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Test email endpoint for debugging
  app.post('/api/test-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const testEmailSent = await emailService.sendEmail({
        to: email,
        subject: "Fundry Test Email",
        html: `
          <h1>Test Email from Fundry</h1>
          <p>This is a test email to verify email delivery is working correctly.</p>
          <p>If you received this email, the email service is configured properly.</p>
        `,
      });

      if (testEmailSent) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

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
      transactions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

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
        return res.status(403).json({ message: 'Access denied: You can only update your own campaigns' });
      }

      // Verify campaign has actual investors before allowing updates
      const investments = await storage.getInvestmentsByCampaign(campaignId);
      const confirmedInvestments = investments.filter(inv => 
        inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed'
      );

      // Log the update creation for audit trail
      console.log(`Founder ${founderId} creating update for campaign ${campaignId} with ${confirmedInvestments.length} confirmed investors`);

      const updateData = {
        campaignId: parseInt(campaignId),
        title,
        content,
        type,
      };

      const update = await storage.createCampaignUpdate(updateData);
      
      // Add metadata about investor reach
      const updateWithMetadata = {
        ...update,
        targetInvestorCount: confirmedInvestments.length,
        investorIds: confirmedInvestments.map(inv => inv.investorId)
      };

      res.json(updateWithMetadata);
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
      allUpdates.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      res.json(allUpdates);
    } catch (error) {
      console.error('Error fetching founder updates:', error);
      res.status(500).json({ message: 'Failed to fetch updates' });
    }
  });

  // Get updates from campaigns the investor has invested in
  app.get('/api/campaign-updates/investor/:investorId', requireAuth, async (req: any, res) => {
    try {
      const investorId = req.params.investorId;
      
      // Strict authorization: only allow investors to access their own updates
      if (investorId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied: You can only view your own updates' });
      }

      // Get all confirmed investments by this investor (committed, paid, completed statuses)
      const investments = await storage.getInvestmentsByInvestor(investorId);
      
      // Filter to only include confirmed investments (exclude pending)
      const confirmedInvestments = investments.filter(inv => 
        inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed'
      );
      
      // If no confirmed investments, return empty array
      if (confirmedInvestments.length === 0) {
        return res.json([]);
      }
      
      // Get unique campaign IDs from confirmed investments only
      const campaignIds = Array.from(new Set(confirmedInvestments.map(inv => inv.campaignId)));
      
      // Get all updates for these campaigns with additional validation
      const allUpdates = [];
      for (const campaignId of campaignIds) {
        const updates = await storage.getCampaignUpdates(campaignId);
        
        // Get campaign details and verify it exists
        const campaign = await storage.getCampaign(campaignId);
        
        // Skip if campaign doesn't exist or is inactive
        if (!campaign || campaign.status !== 'active') {
          continue;
        }
        
        // Add campaign info to each update with investor validation
        const updatesWithCampaign = updates.map(update => ({
          ...update,
          campaign: { 
            id: campaignId,
            title: campaign.title || 'Unknown Campaign',
            founderId: campaign.founderId
          },
          // Add metadata for tracking
          viewedByInvestor: investorId,
          investmentStatus: confirmedInvestments.find(inv => inv.campaignId === campaignId)?.status
        }));
        allUpdates.push(...updatesWithCampaign);
      }
      
      // Sort by creation date, newest first
      allUpdates.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      // Log for audit trail
      console.log(`Investor ${investorId} accessed ${allUpdates.length} updates from ${campaignIds.length} invested campaigns`);
      
      res.json(allUpdates);
    } catch (error) {
      console.error('Error fetching investor updates:', error);
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

  // Update interaction endpoints (likes, shares)
  app.post('/api/campaign-updates/:id/like', requireAuth, async (req: any, res) => {
    try {
      const updateId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Simple in-memory storage for likes (would be database in production)
      const likeKey = `like_${updateId}_${userId}`;
      const countKey = `like_count_${updateId}`;
      
      // Toggle like status
      const isLiked = global.updateLikes?.[likeKey] || false;
      if (!global.updateLikes) global.updateLikes = {};
      if (!global.updateLikeCounts) global.updateLikeCounts = {};
      
      global.updateLikes[likeKey] = !isLiked;
      
      // Update count
      const currentCount = global.updateLikeCounts[countKey] || 12; // Start with base count
      global.updateLikeCounts[countKey] = isLiked ? currentCount - 1 : currentCount + 1;
      
      res.json({ 
        liked: !isLiked, 
        count: global.updateLikeCounts[countKey] 
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ message: 'Failed to toggle like' });
    }
  });

  app.get('/api/campaign-updates/:id/interactions', async (req, res) => {
    try {
      const updateId = parseInt(req.params.id);
      const countKey = `like_count_${updateId}`;
      
      if (!global.updateLikeCounts) global.updateLikeCounts = {};
      
      const likeCount = global.updateLikeCounts[countKey] || 12;
      
      res.json({
        likes: likeCount,
        replies: 3, // Static for now
        shares: 5   // Static for now
      });
    } catch (error) {
      console.error('Error fetching interactions:', error);
      res.status(500).json({ message: 'Failed to fetch interactions' });
    }
  });

  app.post('/api/campaign-updates/:id/reply', requireAuth, async (req: any, res) => {
    try {
      const updateId = parseInt(req.params.id);
      const userId = req.user.id;
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Reply content is required' });
      }
      
      // Simple in-memory storage for replies (would be database in production)
      if (!global.updateReplies) global.updateReplies = {};
      if (!global.updateReplies[updateId]) global.updateReplies[updateId] = [];
      
      const reply = {
        id: Date.now(),
        updateId,
        userId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      };
      
      global.updateReplies[updateId].push(reply);
      
      res.json(reply);
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ message: 'Failed to create reply' });
    }
  });

  app.get('/api/campaign-updates/:id/replies', async (req, res) => {
    try {
      const updateId = parseInt(req.params.id);
      
      if (!global.updateReplies) global.updateReplies = {};
      const replies = global.updateReplies[updateId] || [];
      
      res.json(replies);
    } catch (error) {
      console.error('Error fetching replies:', error);
      res.status(500).json({ message: 'Failed to fetch replies' });
    }
  });

  app.post('/api/campaign-updates/:id/share', requireAuth, async (req: any, res) => {
    try {
      const updateId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Simple tracking of shares
      if (!global.updateShares) global.updateShares = {};
      const shareKey = `share_${updateId}`;
      
      global.updateShares[shareKey] = (global.updateShares[shareKey] || 0) + 1;
      
      res.json({ 
        shared: true, 
        shareCount: global.updateShares[shareKey] 
      });
    } catch (error) {
      console.error('Error recording share:', error);
      res.status(500).json({ message: 'Failed to record share' });
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
      
      // Generate comprehensive SAFE agreement content
      const safeContent = `
SIMPLE AGREEMENT FOR FUTURE EQUITY

Company: ${campaign.title}
Investor: ${investor.firstName} ${investor.lastName}
Email: ${investor.email}
Investment Amount: $${investment.amount}
Discount Rate: ${campaign.discountRate || 20}.00%
Valuation Cap: $${(campaign.valuationCap || 1000000).toLocaleString()}.00
Date: ${new Date().toLocaleDateString()}

This agreement represents the investor's commitment to invest in ${campaign.title} under the terms of a Simple Agreement for Future Equity (SAFE).

Investment Terms:
- Investment Amount: $${investment.amount}
- Discount Rate: ${campaign.discountRate || 20}.00%
- Valuation Cap: $${(campaign.valuationCap || 1000000).toLocaleString()}.00
- Pro Rata Rights: Included

The investment will convert to equity shares upon the next qualifying financing round or liquidity event.

ARTICLE 1: DEFINITIONS

1.1 "Change in Control" means (a) a transaction or series of related transactions in which any "person" or "group" becomes the beneficial owner of more than 50% of the outstanding voting securities of the Company, or (b) any reorganization, merger or consolidation of the Company.

1.2 "Company Capitalization" means the sum, as of immediately prior to the Equity Financing, of (a) all shares of Capital Stock issued and outstanding, assuming exercise or conversion of all outstanding vested and unvested options, warrants and other convertible securities, but excluding this Safe and all other Safes.

1.3 "Conversion Price" means either: (a) the Safe Price or (b) the Discount Price, whichever calculation results in a greater number of shares of Safe Preferred Stock.

1.4 "Discount Price" means the price per share of the Standard Preferred Stock sold in the Equity Financing multiplied by the Discount Rate.

1.5 "Discount Rate" means ${campaign.discountRate || 20}.00%.

1.6 "Dissolution Event" means (a) a voluntary termination of operations, (b) a general assignment for the benefit of the Company's creditors or (c) any other liquidation, dissolution or winding up of the Company.

1.7 "Equity Financing" means a bona fide transaction or series of transactions with the principal purpose of raising capital, pursuant to which the Company issues and sells Preferred Stock at a fixed valuation.

1.8 "Initial Public Offering" means the closing of the Company's first firm commitment underwritten initial public offering of Common Stock pursuant to a registration statement filed under the Securities Act.

1.9 "Liquidity Event" means a Change in Control, a Dissolution Event or an Initial Public Offering.

1.10 "Pro Rata Rights" means a contractual right, but not the obligation, of the Investor to purchase its pro rata share of Private Securities that the Company may issue after the Safe is executed.

1.11 "Safe Price" means $${((investment.amount / (campaign.valuationCap || 1000000)) * 1000000).toFixed(6)} per share.

1.12 "Valuation Cap" means $${(campaign.valuationCap || 1000000).toLocaleString()}.00.

ARTICLE 2: CONVERSION EVENTS

2.1 Equity Financing. If there is an Equity Financing before the expiration or termination of this Safe, the Company will automatically issue to the Investor either: (a) a number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Conversion Price or (b) at the option of the Investor, shares of Standard Preferred Stock.

2.2 Liquidity Event. If there is a Liquidity Event before the expiration or termination of this Safe, the Investor will, at the Investor's option, either: (a) receive a cash payment equal to the Purchase Amount or (b) automatically receive from the Company a number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price.

2.3 Dissolution Event. If there is a Dissolution Event before this Safe expires or terminates, the Investor will receive a cash payment equal to the Purchase Amount, due and payable to the Investor immediately prior to, or concurrent with, the consummation of the Dissolution Event.

ARTICLE 3: COMPANY REPRESENTATIONS

3.1 The Company is a corporation duly organized, validly existing and in good standing under the laws of its jurisdiction of incorporation.

3.2 The execution, delivery and performance by the Company of this Safe is within the power of the Company and has been duly authorized by all necessary corporate actions on the part of the Company.

3.3 This Safe constitutes a legal, valid and binding obligation of the Company, enforceable against the Company in accordance with its terms.

ARTICLE 4: INVESTOR REPRESENTATIONS

4.1 The Investor has full legal capacity, power and authority to execute and deliver this Safe and to perform the Investor's obligations hereunder.

4.2 This Safe constitutes valid and binding obligations of the Investor, enforceable in accordance with its terms.

4.3 The Investor is an accredited investor as such term is defined in Rule 501 of Regulation D under the Securities Act.

4.4 The Investor has been advised that this Safe and the underlying securities have not been registered under the Securities Act, or any state securities laws and, therefore, cannot be resold unless they are registered under the Securities Act and applicable state securities laws or unless an exemption from such registration requirements is available.

ARTICLE 5: ADDITIONAL PROVISIONS

5.1 Pro Rata Rights. The Investor shall have Pro Rata Rights, provided the Investor's Purchase Amount is not less than $${Math.max(1000, investment.amount)}.

5.2 Entire Agreement. This Safe constitutes the full and complete understanding and agreement between the parties with respect to the subject matter hereof, and supersedes all prior understandings and agreements relating to such subject matter.

5.3 Notices. Any notice required or permitted by this Safe will be deemed sufficient when delivered personally or by overnight courier or sent by email to the relevant address listed on the signature page.

5.4 Governing Law. This Safe and all rights and obligations hereunder are governed by the laws of the State of Delaware, without regard to the conflicts of law provisions of such jurisdiction.

5.5 Binding Effect. This Safe shall be binding upon and inure to the benefit of the parties and their successors and assigns.

5.6 Severability. If one or more provisions of this Safe are held to be unenforceable under applicable law, the parties agree to renegotiate such provision in good faith.

5.7 Amendment. This Safe may be amended, modified or waived with the written consent of the Company and the Investor.

ARTICLE 6: SIGNATURE

IN WITNESS WHEREOF, the undersigned have executed this Safe as of the date first written above.

COMPANY: ${campaign.title}

By: _________________________
Name: [Founder Name]
Title: Chief Executive Officer

INVESTOR: ${investor.firstName} ${investor.lastName}

Email: ${investor.email}
Investment Amount: $${investment.amount}
Date: ${new Date().toLocaleDateString()}

Investor Signature:
Date: ${new Date().toLocaleDateString()}

This is a legally binding agreement. Please consult with legal counsel before proceeding.

IMPORTANT NOTICE: This investment involves significant risk and may result in the loss of the entire investment amount. The investor should consult with legal and financial advisors before executing this agreement.
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

  // Security routes
  app.put('/api/user/change-password', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isValidPassword = await comparePasswords(currentPassword, user.password || '');
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password and update
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedNewPassword);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.put('/api/user/2fa', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { enabled } = req.body;
      
      await storage.updateUser2FA(userId, enabled);
      
      res.json({ 
        message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        twoFactorEnabled: enabled
      });
    } catch (error) {
      console.error("Error updating 2FA:", error);
      res.status(500).json({ message: "Failed to update two-factor authentication" });
    }
  });

  // Export user data endpoint
  app.get('/api/user/export-data', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user profile
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's investments
      const investments = await storage.getInvestmentsByInvestor(userId);
      
      // Get user's business profile if they're a founder
      const businessProfile = await storage.getBusinessProfile(userId);
      
      // Get user's campaigns if they're a founder
      const campaigns = await storage.getCampaignsByFounder(userId);
      
      // Get user's notifications
      const notifications = await storage.getUserNotifications(userId);
      
      // Prepare export data
      const exportData = {
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          country: user.country,
          state: user.state,
          bio: user.bio,
          createdAt: user.createdAt,
        },
        businessProfile: businessProfile || null,
        investments: investments.map(inv => ({
          id: inv.id,
          campaignId: inv.campaignId,
          amount: inv.amount,
          status: inv.status,
          paymentStatus: inv.paymentStatus,
          createdAt: inv.createdAt,
        })),
        campaigns: campaigns?.map(campaign => ({
          id: campaign.id,
          title: campaign.title,
          businessSector: campaign.businessSector,
          fundingGoal: campaign.fundingGoal,
          minimumInvestment: campaign.minimumInvestment,
          status: campaign.status,
          createdAt: campaign.createdAt,
        })) || [],
        notifications: notifications.map(notif => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
        })),
        exportedAt: new Date().toISOString(),
        platformInfo: {
          name: "Fundry",
          version: "1.0.0",
          description: "Equity crowdfunding platform data export",
        }
      };
      
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  // Deactivate user account endpoint
  app.post('/api/user/deactivate', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { reason } = req.body;
      
      // Update user status to deactivated
      await storage.deactivateUser(userId, reason || 'No reason provided');
      
      // Log deactivation for audit purposes
      console.log(`User ${userId} deactivated account. Reason: ${reason || 'Not specified'}`);
      
      // Destroy the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });
      
      res.json({ 
        message: "Account deactivated successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error deactivating account:", error);
      res.status(500).json({ message: "Failed to deactivate account" });
    }
  });

  // Notifications routes - using requireAuth for consistency
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.put('/api/notifications/mark-all-read', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.get('/api/notifications/unread-count', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Stripe checkout session endpoint
  app.post('/api/create-checkout-session', requireAuth, async (req: any, res) => {
    try {
      console.log('Checkout session request body:', req.body);
      const { amount, campaignId } = req.body;
      
      if (!amount || !campaignId) {
        console.log('Missing required fields:', { amount, campaignId });
        return res.status(400).json({ message: 'Amount and campaign ID are required' });
      }

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(parseFloat(amount) * 100);
      console.log('Amount in cents:', amountInCents);
      
      // Get campaign details for metadata
      const campaign = await storage.getCampaign(parseInt(campaignId));
      if (!campaign) {
        console.log('Campaign not found:', campaignId);
        return res.status(404).json({ message: 'Campaign not found' });
      }

      console.log('Creating checkout session for campaign:', campaign.title);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Investment in ${campaign.title}`,
                description: `Micro-investment through Fundry platform`,
                images: campaign.logoUrl ? [`${process.env.REPLIT_DEV_DOMAIN || 'https://localhost:5000'}${campaign.logoUrl}`] : [],
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/investment-success?session_id={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}`,
        cancel_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/campaign/${campaignId}`,
        metadata: {
          campaignId: campaignId.toString(),
          investorId: req.user.id.toString(),
          campaignTitle: campaign.title,
        },
        customer_email: req.user.email,
        billing_address_collection: 'required',
        payment_intent_data: {
          description: `Investment in ${campaign.title} via Fundry`,
          metadata: {
            campaignId: campaignId.toString(),
            investorId: req.user.id.toString(),
            campaignTitle: campaign.title,
          },
        },
      });

      console.log('Checkout session created successfully:', session.id);

      res.json({ 
        url: session.url,
        sessionId: session.id
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
    }
  });

  // Payment success verification endpoint
  app.get('/api/payment-success/:sessionId', requireAuth, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Verify the session belongs to the current user
      if (session.metadata?.investorId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized access to session' });
      }

      if (session.payment_status === 'paid') {
        // Create investment record if payment was successful
        const campaignId = parseInt(session.metadata.campaignId);
        const amount = (session.amount_total || 0) / 100; // Convert from cents
        const platformFee = amount > 1000 ? Math.round(amount * 0.05) : 0;
        
        // Check if investment already exists
        const existingInvestments = await storage.getInvestmentsByInvestor(req.user.id);
        const existingInvestment = existingInvestments.find(inv => 
          inv.campaignId === campaignId && inv.paymentIntentId === session.payment_intent
        );

        let investment;
        if (!existingInvestment) {
          // Create new investment record
          investment = await storage.createInvestment({
            campaignId,
            investorId: req.user.id,
            amount: (amount - platformFee).toString(),
            platformFee: platformFee.toString(),
            totalAmount: amount.toString(),
            status: 'paid',
            paymentStatus: 'completed',
            paymentIntentId: session.payment_intent as string,
            agreementSigned: true,
            signedAt: new Date(),
            ipAddress: req.ip
          });
        } else {
          investment = existingInvestment;
        }

        // Get campaign details
        const campaign = await storage.getCampaign(campaignId);

        res.json({
          investmentId: investment.id,
          campaignId,
          campaignTitle: campaign?.title || 'Unknown Campaign',
          amount: parseFloat(investment.amount),
          platformFee: parseFloat(investment.platformFee),
          totalAmount: parseFloat(investment.totalAmount),
          paymentStatus: 'completed'
        });
      } else {
        res.status(400).json({ message: 'Payment not completed' });
      }
    } catch (error) {
      console.error('Error verifying payment success:', error);
      res.status(500).json({ message: 'Failed to verify payment', error: (error as Error).message });
    }
  });

  // Pay Now endpoint for pending investments
  app.post('/api/investments/:id/pay', requireAuth, async (req: any, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      
      // Get the investment
      const investment = await storage.getInvestment(investmentId);
      if (!investment || investment.investorId !== req.user.id) {
        return res.status(404).json({ message: 'Investment not found' });
      }

      if (investment.status !== 'pending') {
        return res.status(400).json({ message: 'Investment is not in pending status' });
      }

      // Get campaign details
      const campaign = await storage.getCampaign(investment.campaignId);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Calculate amounts
      const amount = parseFloat(investment.amount);
      const platformFee = parseFloat(investment.platformFee);
      const totalAmount = amount + platformFee;

      // Validate logo URL for Stripe (must be HTTPS and valid format)
      const isValidUrl = (url: string) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'https:' && (
            parsed.pathname.endsWith('.jpg') || 
            parsed.pathname.endsWith('.jpeg') || 
            parsed.pathname.endsWith('.png') ||
            parsed.pathname.endsWith('.gif')
          );
        } catch {
          return false;
        }
      };

      const validLogoUrl = campaign.logoUrl && isValidUrl(campaign.logoUrl) ? campaign.logoUrl : null;

      // Get base URL from request
      const protocol = req.secure ? 'https' : 'http';
      const host = req.get('host') || `${process.env.REPL_ID}.replit.app`;
      const baseUrl = `${protocol}://${host}`;

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Investment in ${campaign.title}`,
                description: `SAFE investment of $${amount} with $${platformFee} platform fee`,
                images: validLogoUrl ? [validLogoUrl] : [],
              },
              unit_amount: Math.round(totalAmount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/investment-success?session_id={CHECKOUT_SESSION_ID}&campaign_id=${campaign.id}`,
        cancel_url: `${baseUrl}/investor-dashboard`,
        allow_promotion_codes: false,
        billing_address_collection: 'auto',
        payment_intent_data: {
          metadata: {
            investmentId: investmentId.toString(),
            campaignId: campaign.id.toString(),
            investorId: req.user.id,
            amount: amount.toString(),
            platformFee: platformFee.toString(),
          }
        },
        customer_email: req.user.email,
      });

      res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error('Error creating payment session:', error);
      res.status(500).json({ message: 'Failed to create payment session', error: (error as Error).message });
    }
  });

  // Update investment endpoint
  app.put('/api/investments/:id', requireAuth, async (req: any, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      const { amount } = req.body;
      
      // Validate amount
      if (!amount || parseFloat(amount) < 25) {
        return res.status(400).json({ message: 'Investment amount must be at least $25' });
      }

      // Get the investment
      const investment = await storage.getInvestment(investmentId);
      if (!investment || investment.investorId !== req.user.id) {
        return res.status(404).json({ message: 'Investment not found' });
      }

      if (investment.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending investments can be edited' });
      }

      // Calculate new amounts
      const newAmount = parseFloat(amount);
      const platformFee = newAmount > 1000 ? Math.round(newAmount * 0.05) : 0;
      const totalAmount = newAmount + platformFee;

      // Update investment
      const updatedInvestment = await storage.updateInvestment(investmentId, {
        amount: newAmount.toString(),
        platformFee: platformFee.toString(),
        totalAmount: totalAmount.toString(),
      });

      res.json(updatedInvestment);
    } catch (error) {
      console.error('Error updating investment:', error);
      res.status(500).json({ message: 'Failed to update investment', error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
