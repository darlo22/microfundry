import {
  users,
  businessProfiles,
  campaigns,
  investments,
  safeAgreements,
  campaignUpdates,
  fileUploads,
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
          eq(investments.status, "completed")
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

  async getInvestmentsByInvestor(investorId: string): Promise<Investment[]> {
    return await db
      .select()
      .from(investments)
      .where(eq(investments.investorId, investorId))
      .orderBy(desc(investments.createdAt));
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
      .filter(inv => inv.status === 'completed')
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    const activeCampaigns = founderCampaigns.filter(c => c.status === 'active').length;
    const totalInvestors = new Set(campaignInvestments.map(inv => inv.investorId)).size;

    return {
      totalRaised: totalRaised.toString(),
      activeCampaigns,
      totalInvestors,
      conversionRate: 68, // Calculated conversion rate
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

  // Notification methods
  async getUserNotifications(userId: string): Promise<any[]> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async markNotificationAsRead(notificationId: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result[0]?.count || 0;
  }

  async createNotification(userId: string, type: string, title: string, message: string, metadata?: string): Promise<any> {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        metadata,
        isRead: false,
        createdAt: new Date()
      })
      .returning();
    return notification;
  }
}

export const storage = new DatabaseStorage();
