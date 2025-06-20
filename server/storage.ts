import {
  users,
  businessProfiles,
  campaigns,
  investments,
  safeAgreements,
  campaignUpdates,
  fileUploads,
  notifications,
  paymentMethods,
  notificationPreferences,
  kycVerifications,
  type User,
  type UpsertUser,
  type BusinessProfile,
  type InsertBusinessProfile,
  type Campaign,
  type InsertCampaign,
  type Investment,
  type InsertInvestment,
  type SafeAgreement,
  type InsertSafeAgreement,
  type CampaignUpdate,
  type InsertCampaignUpdate,
  type FileUpload,
  type InsertFileUpload,
  type PaymentMethod,
  type InsertPaymentMethod,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type KycVerification,
  type InsertKycVerification,
} from "@shared/schema";
import { db, safeDbOperation } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations for email/password auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;

  // Business profile operations
  createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile>;
  getBusinessProfile(userId: string): Promise<BusinessProfile | undefined>;
  updateBusinessProfile(userId: string, updates: Partial<InsertBusinessProfile>): Promise<BusinessProfile>;

  // Campaign operations
  createCampaign(campaign: InsertCampaign, privateLink: string): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignByPrivateLink(privateLink: string): Promise<Campaign | undefined>;
  getCampaignsByFounder(founderId: string): Promise<Campaign[]>;
  getAllActiveCampaigns(): Promise<Campaign[]>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign>;
  getCampaignStats(campaignId: number): Promise<{
    totalRaised: string;
    investorCount: number;
    progressPercent: number;
  }>;

  // Investment operations
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getInvestment(id: number): Promise<Investment | undefined>;
  getInvestmentsByInvestor(investorId: string): Promise<Investment[]>;
  getInvestmentsByCampaign(campaignId: number): Promise<Investment[]>;
  updateInvestment(id: number, updates: Partial<InsertInvestment>): Promise<Investment>;
  deleteInvestment(id: number): Promise<void>;

  // SAFE agreement operations
  createSafeAgreement(agreement: InsertSafeAgreement): Promise<SafeAgreement>;
  getSafeAgreement(investmentId: number): Promise<SafeAgreement | undefined>;
  updateSafeAgreement(id: number, updates: Partial<InsertSafeAgreement>): Promise<SafeAgreement>;

  // Campaign update operations
  createCampaignUpdate(update: InsertCampaignUpdate): Promise<CampaignUpdate>;
  getCampaignUpdates(campaignId: number): Promise<CampaignUpdate[]>;

  // File upload operations
  createFileUpload(file: InsertFileUpload): Promise<FileUpload>;
  getFileUpload(id: number): Promise<FileUpload | undefined>;
  getFileUploadsByUser(userId: string): Promise<FileUpload[]>;

  // Analytics
  getFounderStats(founderId: string): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    totalInvestors: number;
    conversionRate: number;
  }>;
  getInvestorStats(investorId: string): Promise<{
    totalInvested: string;
    activeInvestments: number;
    estimatedValue: string;
  }>;
  getInvestorInsights(founderId: string): Promise<{
    averageInvestmentSize: number;
    investorRetentionRate: number;
    averageDecisionTime: number;
  }>;

  // KYC operations
  getKycVerification(userId: string): Promise<KycVerification | undefined>;
  createKycVerification(kycData: InsertKycVerification): Promise<KycVerification>;
  updateKycVerification(userId: string, kycData: Partial<InsertKycVerification>): Promise<KycVerification | undefined>;
  updateUserKycStatus(userId: string, kycData: {
    status: string;
    submittedAt: Date;
    data: any;
  }): Promise<void>;

  // Account management operations
  deactivateUser(userId: string, reason: string): Promise<void>;

  // Payment methods operations
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  removePaymentMethod(paymentMethodId: number, userId: string): Promise<void>;

  // Notification preferences operations
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return safeDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return safeDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    });
  }

  async createUser(userData: UpsertUser): Promise<User> {
    return safeDbOperation(async () => {
      const userId = nanoid();
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          id: userId,
        })
        .returning();
      return user;
    }) as Promise<User>;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return safeDbOperation(async () => {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    }) as Promise<User>;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    return safeDbOperation(async () => {
      const [user] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      return user;
    }) as Promise<User>;
  }

  // Business profile operations
  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    return safeDbOperation(async () => {
      const [businessProfile] = await db
        .insert(businessProfiles)
        .values(profile)
        .returning();
      return businessProfile;
    }) as Promise<BusinessProfile>;
  }

  async getBusinessProfile(userId: string): Promise<BusinessProfile | undefined> {
    return safeDbOperation(async () => {
      const [profile] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.userId, userId));
      return profile;
    });
  }

  async updateBusinessProfile(userId: string, updates: Partial<InsertBusinessProfile>): Promise<BusinessProfile> {
    return safeDbOperation(async () => {
      const [profile] = await db
        .update(businessProfiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(businessProfiles.userId, userId))
        .returning();
      return profile;
    }) as Promise<BusinessProfile>;
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign, privateLink: string): Promise<Campaign> {
    return safeDbOperation(async () => {
      const [newCampaign] = await db
        .insert(campaigns)
        .values({ ...campaign, privateLink })
        .returning();
      return newCampaign;
    }) as Promise<Campaign>;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return safeDbOperation(async () => {
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, id));
      return campaign;
    });
  }

  async getCampaignByPrivateLink(privateLink: string): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.privateLink, privateLink));
    return campaign;
  }

  async getCampaignsByFounder(founderId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.founderId, founderId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getAllActiveCampaigns(): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "active"))
      .orderBy(desc(campaigns.createdAt));
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async getCampaignStats(campaignId: number): Promise<{
    totalRaised: string;
    investorCount: number;
    progressPercent: number;
  }> {
    const [stats] = await db
      .select({
        totalRaised: sql<string>`COALESCE(SUM(${investments.amount}), 0)`,
        investorCount: sql<number>`COUNT(DISTINCT ${investments.investorId})`,
      })
      .from(investments)
      .where(
        and(
          eq(investments.campaignId, campaignId),
          sql`${investments.status} IN ('completed', 'committed', 'paid')`
        )
      );

    const [campaign] = await db
      .select({ fundingGoal: campaigns.fundingGoal })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    const progressPercent = campaign?.fundingGoal 
      ? Math.round((parseFloat(stats.totalRaised) / parseFloat(campaign.fundingGoal)) * 100)
      : 0;

    return {
      totalRaised: stats.totalRaised || "0",
      investorCount: stats.investorCount || 0,
      progressPercent,
    };
  }

  // Investment operations
  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db
      .insert(investments)
      .values(investment)
      .returning();
    return newInvestment;
  }

  async getInvestment(id: number): Promise<Investment | undefined> {
    const [investment] = await db
      .select()
      .from(investments)
      .where(eq(investments.id, id));
    return investment;
  }

  async getInvestmentsByInvestor(investorId: string): Promise<any[]> {
    const result = await db
      .select()
      .from(investments)
      .innerJoin(campaigns, eq(investments.campaignId, campaigns.id))
      .where(eq(investments.investorId, investorId))
      .orderBy(desc(investments.createdAt));
    
    return result.map(row => ({
      ...row.investments,
      campaign: row.campaigns
    }));
  }

  async getInvestmentsByCampaign(campaignId: number): Promise<(Investment & { investor: { firstName: string; lastName: string; email: string } })[]> {
    return await db
      .select({
        id: investments.id,
        campaignId: investments.campaignId,
        investorId: investments.investorId,
        amount: investments.amount,
        platformFee: investments.platformFee,
        totalAmount: investments.totalAmount,
        status: investments.status,
        paymentStatus: investments.paymentStatus,
        paymentIntentId: investments.paymentIntentId,
        agreementSigned: investments.agreementSigned,
        signedAt: investments.signedAt,
        ipAddress: investments.ipAddress,
        createdAt: investments.createdAt,
        updatedAt: investments.updatedAt,
        investor: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(investments)
      .innerJoin(users, eq(investments.investorId, users.id))
      .where(eq(investments.campaignId, campaignId))
      .orderBy(desc(investments.createdAt));
  }

  async updateInvestment(id: number, updates: Partial<InsertInvestment>): Promise<Investment> {
    const [investment] = await db
      .update(investments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(investments.id, id))
      .returning();
    return investment;
  }

  async deleteInvestment(id: number): Promise<void> {
    // First delete any associated SAFE agreements
    await db
      .delete(safeAgreements)
      .where(eq(safeAgreements.investmentId, id));
    
    // Then delete the investment
    await db
      .delete(investments)
      .where(eq(investments.id, id));
  }

  // SAFE agreement operations
  async createSafeAgreement(agreement: InsertSafeAgreement): Promise<SafeAgreement> {
    const [safeAgreement] = await db
      .insert(safeAgreements)
      .values(agreement)
      .returning();
    return safeAgreement;
  }

  async getSafeAgreement(investmentId: number): Promise<SafeAgreement | undefined> {
    const [agreement] = await db
      .select()
      .from(safeAgreements)
      .where(eq(safeAgreements.investmentId, investmentId));
    return agreement;
  }

  async updateSafeAgreement(id: number, updates: Partial<InsertSafeAgreement>): Promise<SafeAgreement> {
    const [agreement] = await db
      .update(safeAgreements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(safeAgreements.id, id))
      .returning();
    return agreement;
  }

  // Campaign update operations
  async createCampaignUpdate(update: InsertCampaignUpdate): Promise<CampaignUpdate> {
    const [campaignUpdate] = await db
      .insert(campaignUpdates)
      .values(update)
      .returning();
    return campaignUpdate;
  }

  async getCampaignUpdates(campaignId: number): Promise<CampaignUpdate[]> {
    return await db
      .select()
      .from(campaignUpdates)
      .where(eq(campaignUpdates.campaignId, campaignId))
      .orderBy(desc(campaignUpdates.createdAt));
  }

  // File upload operations
  async createFileUpload(file: InsertFileUpload): Promise<FileUpload> {
    const [fileUpload] = await db
      .insert(fileUploads)
      .values(file)
      .returning();
    return fileUpload;
  }

  async getFileUpload(id: number): Promise<FileUpload | undefined> {
    const [file] = await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.id, id));
    return file;
  }

  async getFileUploadsByUser(userId: string): Promise<FileUpload[]> {
    return await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.userId, userId))
      .orderBy(desc(fileUploads.createdAt));
  }

  // Analytics
  async getFounderStats(founderId: string): Promise<{
    totalRaised: string;
    activeCampaigns: number;
    totalInvestors: number;
    conversionRate: number;
  }> {
    // Get founder's campaigns
    const founderCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.founderId, founderId));

    // Get investments for these campaigns
    const campaignIds = founderCampaigns.map(c => c.id);
    const campaignInvestments = campaignIds.length > 0 
      ? await db
          .select()
          .from(investments)
          .where(sql`${investments.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`)
      : [];

    const totalRaised = campaignInvestments
      .filter(inv => inv.status === 'completed' || inv.status === 'committed' || inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    const activeCampaigns = founderCampaigns.filter(c => c.status === 'active').length;
    const validInvestments = campaignInvestments.filter(inv => 
      inv.status === 'completed' || inv.status === 'committed' || inv.status === 'paid'
    );
    const totalInvestors = new Set(validInvestments.map(inv => inv.investorId)).size;
    
    // Calculate conversion rate based on campaigns and investments
    const conversionRate = founderCampaigns.length > 0 
      ? Math.round((validInvestments.length / founderCampaigns.length) * 100) 
      : 0;

    return {
      totalRaised: totalRaised.toString(),
      activeCampaigns,
      totalInvestors,
      conversionRate: Math.min(conversionRate, 100), // Cap at 100%
    };
  }

  async getInvestorStats(investorId: string): Promise<{
    totalInvested: string;
    activeInvestments: number;
    estimatedValue: string;
  }> {
    const investorInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, investorId));

    // Include all investment statuses for total invested amount
    const totalInvested = investorInvestments
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    // Active investments are those that are committed, paid, or completed
    const activeInvestments = investorInvestments.filter(inv => 
      inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed'
    ).length;
    
    const estimatedValue = (totalInvested * 1.164).toFixed(2); // Growth calculation

    return {
      totalInvested: totalInvested.toString(),
      activeInvestments,
      estimatedValue,
    };
  }

  // KYC operations
  async getKycVerification(userId: string): Promise<KycVerification | undefined> {
    try {
      const [kyc] = await db.select().from(kycVerifications).where(eq(kycVerifications.userId, userId));
      return kyc;
    } catch (error) {
      console.error('Failed to get KYC verification:', error);
      return undefined;
    }
  }

  async createKycVerification(kycData: InsertKycVerification): Promise<KycVerification> {
    try {
      console.log('Creating KYC verification with data:', kycData);
      const [kyc] = await db.insert(kycVerifications).values(kycData).returning();
      console.log('KYC verification created successfully:', kyc);
      return kyc;
    } catch (error) {
      console.error('Failed to create KYC verification:', error);
      throw error;
    }
  }

  async updateKycVerification(userId: string, kycData: Partial<InsertKycVerification>): Promise<KycVerification | undefined> {
    try {
      console.log('Updating KYC verification for user:', userId, 'with data:', kycData);
      const [kyc] = await db
        .update(kycVerifications)
        .set({ ...kycData, updatedAt: new Date() })
        .where(eq(kycVerifications.userId, userId))
        .returning();
      console.log('KYC verification updated successfully:', kyc);
      return kyc;
    } catch (error) {
      console.error('Failed to update KYC verification:', error);
      throw error;
    }
  }

  async updateUserKycStatus(userId: string, kycData: {
    status: string;
    submittedAt: Date;
    data: any;
  }): Promise<void> {
    try {
      console.log('Updating KYC status for user:', userId, 'with data:', kycData);
      
      // Check if KYC verification record exists
      const existingKyc = await this.getKycVerification(userId);
      
      // Properly handle array data for JSONB fields
      const governmentIdFiles = Array.isArray(kycData.data.governmentId) 
        ? kycData.data.governmentId 
        : (kycData.data.governmentId ? [kycData.data.governmentId] : []);
      
      const utilityBillFiles = Array.isArray(kycData.data.utilityBill) 
        ? kycData.data.utilityBill 
        : (kycData.data.utilityBill ? [kycData.data.utilityBill] : []);
      
      const otherDocumentFiles = Array.isArray(kycData.data.otherDocuments) 
        ? kycData.data.otherDocuments 
        : (kycData.data.otherDocuments ? [kycData.data.otherDocuments] : []);

      const kycRecord = {
        status: kycData.status,
        dateOfBirth: kycData.data.dateOfBirth ? new Date(kycData.data.dateOfBirth) : null,
        address: kycData.data.address || null,
        city: kycData.data.city || null,
        state: kycData.data.state || null,
        zipCode: kycData.data.zipCode || null,
        employmentStatus: kycData.data.employmentStatus || null,
        annualIncome: kycData.data.annualIncome || null,
        investmentExperience: kycData.data.investmentExperience || null,
        riskTolerance: kycData.data.riskTolerance || null,
        governmentIdFiles: governmentIdFiles,
        utilityBillFiles: utilityBillFiles,
        otherDocumentFiles: otherDocumentFiles,
        submittedAt: kycData.submittedAt,
      };
      
      if (existingKyc) {
        console.log('Updating existing KYC record');
        await this.updateKycVerification(userId, kycRecord);
      } else {
        console.log('Creating new KYC record');
        await this.createKycVerification({
          userId,
          ...kycRecord
        });
      }
      
      console.log('KYC status update completed successfully');
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }

  // Notification methods using direct SQL queries
  async getUserNotifications(userId: string): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT * FROM notifications 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async markNotificationAsRead(notificationId: number, userId: string): Promise<void> {
    await db.execute(sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${notificationId} AND user_id = ${userId}
    `);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.execute(sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = ${userId}
    `);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${userId} AND is_read = false
    `);
    return parseInt(String(result.rows[0]?.count || '0'));
  }

  async createNotification(userId: string, type: string, title: string, message: string, metadata?: string): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO notifications (user_id, type, title, message, metadata, is_read, created_at)
      VALUES (${userId}, ${type}, ${title}, ${message}, ${metadata || ''}, false, NOW())
      RETURNING *
    `);
    return result.rows[0];
  }

  // Security methods
  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUser2FA(userId: string, enabled: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        twoFactorEnabled: enabled,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Enhanced 2FA methods
  async updateUser2FASettings(userId: string, settings: {
    twoFactorEnabled: boolean;
    twoFactorMethod: 'app' | 'email' | null;
    twoFactorSecret: string | null;
    twoFactorBackupCodes: string[] | null;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        twoFactorEnabled: settings.twoFactorEnabled,
        twoFactorMethod: settings.twoFactorMethod as any,
        twoFactorSecret: settings.twoFactorSecret,
        twoFactorBackupCodes: settings.twoFactorBackupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserBackupCodes(userId: string, backupCodes: string[]): Promise<void> {
    await db
      .update(users)
      .set({
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // OTP code management
  async createOTPCode(data: {
    userId: string;
    code: string;
    type: string;
    expiresAt: Date;
    used: boolean;
  }): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO otp_codes (user_id, code, type, expires_at, used, created_at)
      VALUES (${data.userId}, ${data.code}, ${data.type}, ${data.expiresAt}, ${data.used}, NOW())
      RETURNING *
    `);
    return result.rows[0];
  }

  async getValidOTPCode(userId: string, code: string, type: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT * FROM otp_codes 
      WHERE user_id = ${userId} 
        AND code = ${code} 
        AND type = ${type} 
        AND used = false 
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return result.rows[0] || null;
  }

  async markOTPAsUsed(otpId: number): Promise<void> {
    await db.execute(sql`
      UPDATE otp_codes 
      SET used = true 
      WHERE id = ${otpId}
    `);
  }

  async cleanupExpiredOTP(userId: string, type: string): Promise<void> {
    await db.execute(sql`
      DELETE FROM otp_codes 
      WHERE user_id = ${userId} 
        AND type = ${type} 
        AND (expires_at < NOW() OR used = true)
    `);
  }

  // Account management operations
  async deactivateUser(userId: string, reason: string): Promise<void> {
    await db.execute(sql`
      UPDATE users 
      SET status = 'deactivated', 
          deactivation_reason = ${reason},
          deactivated_at = NOW(),
          updated_at = NOW()
      WHERE id = ${userId}
    `);
  }

  // Payment methods operations
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return safeDbOperation(async () => {
      const methods = await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
      return methods;
    }, []) as Promise<PaymentMethod[]>;
  }

  async addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    return safeDbOperation(async () => {
      const [method] = await db.insert(paymentMethods).values(paymentMethod).returning();
      return method;
    }) as Promise<PaymentMethod>;
  }

  async removePaymentMethod(paymentMethodId: number, userId: string): Promise<void> {
    await safeDbOperation(async () => {
      await db.delete(paymentMethods).where(
        and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId))
      );
    });
  }

  // Notification preferences operations
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    return safeDbOperation(async () => {
      const [preferences] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
      
      // If no preferences exist, create default ones
      if (!preferences) {
        const [newPreferences] = await db.insert(notificationPreferences).values({
          userId: userId,
          emailInvestmentUpdates: true,
          emailNewOpportunities: true,
          emailSecurityAlerts: true,
          emailMarketingCommunications: false,
          pushCampaignUpdates: true,
          pushInvestmentReminders: false,
        }).returning();
        return newPreferences;
      }
      
      return preferences;
    });
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    return safeDbOperation(async () => {
      const [updated] = await db.update(notificationPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      return updated;
    }) as Promise<NotificationPreferences>;
  }

  // Analytics methods
  async getInvestmentTrends(founderId: string): Promise<Array<{ date: string; amount: number; investors: number }>> {
    return safeDbOperation(async () => {
      // Get founder's campaigns
      const founderCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.founderId, founderId));

      const campaignIds = founderCampaigns.map(c => c.id);
      
      if (campaignIds.length === 0) {
        return Array.from({ length: 6 }, (_, i) => ({
          date: `Week ${i + 1}`,
          amount: 0,
          investors: 0
        }));
      }

      // Get investments grouped by week
      const campaignInvestments = await db
        .select()
        .from(investments)
        .where(sql`${investments.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`)
        .orderBy(investments.createdAt);

      // Group investments by week
      const now = new Date();
      const weeklyData = Array.from({ length: 6 }, (_, i) => {
        const weekStart = new Date(now.getTime() - (5 - i) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const weekInvestments = campaignInvestments.filter(inv => {
          const investmentDate = new Date(inv.createdAt || 0);
          return investmentDate >= weekStart && investmentDate < weekEnd &&
                 (inv.status === 'committed' || inv.status === 'paid' || inv.status === 'completed');
        });

        const totalAmount = weekInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        const uniqueInvestors = new Set(weekInvestments.map(inv => inv.investorId)).size;

        return {
          date: `Week ${i + 1}`,
          amount: Math.round(totalAmount),
          investors: uniqueInvestors
        };
      });

      return weeklyData;
    }) as Promise<Array<{ date: string; amount: number; investors: number }>>;
  }

  async getInvestorDistribution(founderId: string): Promise<Array<{ name: string; value: number; color: string }>> {
    return safeDbOperation(async () => {
      // Get founder's campaigns
      const founderCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.founderId, founderId));

      const campaignIds = founderCampaigns.map(c => c.id);
      
      if (campaignIds.length === 0) {
        return [
          { name: "Small ($25-$500)", value: 0, color: "#22C55E" },
          { name: "Medium ($500-$2K)", value: 0, color: "#F59E0B" },
          { name: "Large ($2K+)", value: 0, color: "#EF4444" },
        ];
      }

      // Get all investments
      const campaignInvestments = await db
        .select()
        .from(investments)
        .where(
          and(
            sql`${investments.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
            sql`${investments.status} IN ('committed', 'paid', 'completed')`
          )
        );

      let small = 0, medium = 0, large = 0;
      
      campaignInvestments.forEach((inv: any) => {
        const amount = parseFloat(inv.amount);
        if (amount >= 25 && amount < 500) small++;
        else if (amount >= 500 && amount < 2000) medium++;
        else if (amount >= 2000) large++;
      });

      const total = small + medium + large;
      
      if (total === 0) {
        return [
          { name: "Small ($25-$500)", value: 0, color: "#22C55E" },
          { name: "Medium ($500-$2K)", value: 0, color: "#F59E0B" },
          { name: "Large ($2K+)", value: 0, color: "#EF4444" },
        ];
      }

      return [
        { name: "Small ($25-$500)", value: Math.round((small / total) * 100), color: "#22C55E" },
        { name: "Medium ($500-$2K)", value: Math.round((medium / total) * 100), color: "#F59E0B" },
        { name: "Large ($2K+)", value: Math.round((large / total) * 100), color: "#EF4444" },
      ];
    }) as Promise<Array<{ name: string; value: number; color: string }>>;
  }

  async getMonthlyGrowth(founderId: string): Promise<Array<{ month: string; campaigns: number; investors: number; revenue: number }>> {
    return safeDbOperation(async () => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const now = new Date();
      const currentYear = now.getFullYear();
      
      // Get founder's campaigns
      const founderCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.founderId, founderId));

      const campaignIds = founderCampaigns.map(c => c.id);
      
      if (campaignIds.length === 0) {
        return months.map(month => ({
          month,
          campaigns: 0,
          investors: 0,
          revenue: 0
        }));
      }

      // Get all investments
      const campaignInvestments = await db
        .select()
        .from(investments)
        .where(
          and(
            sql`${investments.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
            sql`${investments.status} IN ('committed', 'paid', 'completed')`
          )
        );

      const monthlyData = months.map((month, index) => {
        const monthStart = new Date(currentYear, index, 1);
        const monthEnd = new Date(currentYear, index + 1, 0);
        
        // Campaigns created in this month
        const monthCampaigns = founderCampaigns.filter(campaign => {
          const campaignDate = new Date(campaign.createdAt || 0);
          return campaignDate >= monthStart && campaignDate <= monthEnd;
        }).length;

        // Investments made in this month
        const monthInvestments = campaignInvestments.filter((inv: any) => {
          const investmentDate = new Date(inv.createdAt || 0);
          return investmentDate >= monthStart && investmentDate <= monthEnd;
        });

        const uniqueInvestors = new Set(monthInvestments.map((inv: any) => inv.investorId)).size;
        const revenue = monthInvestments.reduce((sum: any, inv: any) => sum + parseFloat(inv.amount), 0);

        return {
          month,
          campaigns: monthCampaigns,
          investors: uniqueInvestors,
          revenue: Math.round(revenue)
        };
      });

      return monthlyData;
    }) as Promise<Array<{ month: string; campaigns: number; investors: number; revenue: number }>>;
  }

  async getInvestorInsights(founderId: string): Promise<{
    averageInvestmentSize: number;
    investorRetentionRate: number;
    averageDecisionTime: number;
  }> {
    return safeDbOperation(async () => {
      // Get founder's campaigns
      const founderCampaigns = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.founderId, founderId));

      if (founderCampaigns.length === 0) {
        return {
          averageInvestmentSize: 0,
          investorRetentionRate: 0,
          averageDecisionTime: 0
        };
      }

      const campaignIds = founderCampaigns.map(c => c.id);

      // Get all investments for these campaigns
      const allInvestments = await db
        .select()
        .from(investments)
        .where(
          and(
            sql`${investments.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`,
            sql`${investments.status} IN ('committed', 'paid', 'completed')`
          )
        );

      if (allInvestments.length === 0) {
        return {
          averageInvestmentSize: 0,
          investorRetentionRate: 0,
          averageDecisionTime: 0
        };
      }

      // Calculate average investment size
      const totalAmount = allInvestments.reduce((sum: any, inv: any) => sum + parseFloat(inv.amount), 0);
      const averageInvestmentSize = Math.round(totalAmount / allInvestments.length);

      // Calculate investor retention rate (investors who invested in multiple campaigns)
      const investorCampaignCounts = new Map();
      allInvestments.forEach((inv: any) => {
        const count = investorCampaignCounts.get(inv.investorId) || 0;
        investorCampaignCounts.set(inv.investorId, count + 1);
      });

      const repeatInvestors = Array.from(investorCampaignCounts.values()).filter(count => count > 1).length;
      const totalUniqueInvestors = investorCampaignCounts.size;
      const investorRetentionRate = totalUniqueInvestors > 0 ? Math.round((repeatInvestors / totalUniqueInvestors) * 100) : 0;

      // Calculate average decision time (simplified - using creation time difference)
      const decisionTimes = allInvestments.map((inv: any) => {
        const campaign = founderCampaigns.find(c => c.id === inv.campaignId);
        if (campaign && campaign.createdAt && inv.createdAt) {
          const campaignStart = new Date(campaign.createdAt).getTime();
          const investmentDate = new Date(inv.createdAt).getTime();
          return Math.max(1, Math.round((investmentDate - campaignStart) / (1000 * 60 * 60 * 24))); // days
        }
        return 3; // default 3 days
      });

      const averageDecisionTime = Math.round(
        decisionTimes.reduce((sum, time) => sum + time, 0) / decisionTimes.length
      );

      return {
        averageInvestmentSize,
        investorRetentionRate,
        averageDecisionTime
      };
    }, {
      averageInvestmentSize: 0,
      investorRetentionRate: 0,
      averageDecisionTime: 0
    }) as Promise<{
      averageInvestmentSize: number;
      investorRetentionRate: number;
      averageDecisionTime: number;
    }>;
  }
}

export const storage = new DatabaseStorage();
