import {
  users,
  businessProfiles,
  campaigns,
  investments,
  safeAgreements,
  campaignUpdates,
  fileUploads,
  notifications,
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
} from "@shared/schema";
import { db } from "./db";
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

  // KYC operations
  updateUserKycStatus(userId: string, kycData: {
    status: string;
    submittedAt: Date;
    data: any;
  }): Promise<void>;

  // Account management operations
  deactivateUser(userId: string, reason: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const userId = nanoid();
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: userId,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Business profile operations
  async createBusinessProfile(profile: InsertBusinessProfile): Promise<BusinessProfile> {
    const [businessProfile] = await db
      .insert(businessProfiles)
      .values(profile)
      .returning();
    return businessProfile;
  }

  async getBusinessProfile(userId: string): Promise<BusinessProfile | undefined> {
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId));
    return profile;
  }

  async updateBusinessProfile(userId: string, updates: Partial<InsertBusinessProfile>): Promise<BusinessProfile> {
    const [profile] = await db
      .update(businessProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign, privateLink: string): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values({ ...campaign, privateLink })
      .returning();
    return newCampaign;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));
    return campaign;
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

    const totalInvested = investorInvestments
      .filter(inv => inv.status === 'completed')
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    const activeInvestments = investorInvestments.filter(inv => inv.status === 'completed').length;
    const estimatedValue = (totalInvested * 1.164).toFixed(2); // Growth calculation

    return {
      totalInvested: totalInvested.toString(),
      activeInvestments,
      estimatedValue,
    };
  }

  // KYC operations
  async updateUserKycStatus(userId: string, kycData: {
    status: string;
    submittedAt: Date;
    data: any;
  }): Promise<void> {
    // In a real implementation, this would update a KYC table
    // For now, we'll simulate storing the KYC status
    console.log(`Updating KYC status for user ${userId}:`, kycData);
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
}

export const storage = new DatabaseStorage();
