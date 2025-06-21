import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Email verification tokens table
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().$defaultFn(() => nanoid()),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User storage table for email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  userType: varchar("user_type", { enum: ["founder", "investor", "admin"] }).notNull(),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  country: varchar("country"),
  state: varchar("state"),
  bio: text("bio"),
  dateOfBirth: timestamp("date_of_birth"),
  occupation: varchar("occupation"),
  annualIncome: varchar("annual_income"),
  investmentExperience: varchar("investment_experience"),
  isEmailVerified: boolean("is_email_verified").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"), // TOTP secret for authenticator apps
  twoFactorMethod: varchar("two_factor_method", { enum: ["app", "email"] }), // Preferred 2FA method
  twoFactorBackupCodes: jsonb("two_factor_backup_codes"), // Array of backup codes
  passwordLastChanged: timestamp("password_last_changed").defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id"),
  status: varchar("status", { enum: ["active", "suspended", "pending"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business profiles for founders
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  businessSector: varchar("business_sector").notNull(),
  countryOfIncorporation: varchar("country_of_incorporation").notNull(),
  yearOfFormation: integer("year_of_formation"),
  businessAddress: text("business_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns created by founders
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  founderId: varchar("founder_id").references(() => users.id).notNull(),
  businessProfileId: integer("business_profile_id").references(() => businessProfiles.id),
  title: varchar("title").notNull(),
  shortPitch: text("short_pitch").notNull(),
  fullPitch: text("full_pitch").notNull(),
  logoUrl: varchar("logo_url"),
  pitchMediaUrl: varchar("pitch_media_url"),
  pitchDeckUrl: varchar("pitch_deck_url"),
  fundingGoal: decimal("funding_goal", { precision: 10, scale: 2 }).notNull(),
  minimumInvestment: decimal("minimum_investment", { precision: 10, scale: 2 }).notNull().default("25"),
  deadline: timestamp("deadline"),
  status: varchar("status").notNull().default("draft"), // draft, active, paused, closed, funded, cancelled
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).notNull().default("20"),
  valuationCap: decimal("valuation_cap", { precision: 15, scale: 2 }),
  privateLink: varchar("private_link").unique().notNull(),
  
  // Business Information
  companyName: varchar("company_name"),
  country: varchar("country"),
  state: varchar("state"),
  businessAddress: text("business_address"),
  registrationStatus: varchar("registration_status"), // "registered" or "in-process"
  registrationType: varchar("registration_type"),
  directors: jsonb("directors"), // Array of director objects
  
  // Business Strategy Information
  problemStatement: text("problem_statement"),
  solution: text("solution"),
  marketOpportunity: text("market_opportunity"),
  businessModel: text("business_model"),
  goToMarketStrategy: text("go_to_market_strategy"),
  competitiveLandscape: text("competitive_landscape"),
  
  // Traction & Stage Information
  startupStage: varchar("startup_stage"),
  currentRevenue: varchar("current_revenue"),
  customers: varchar("customers"),
  previousFunding: varchar("previous_funding"),
  keyMilestones: text("key_milestones"),
  
  // Team Information
  teamStructure: varchar("team_structure").notNull().default("solo"), // solo, team
  teamMembers: jsonb("team_members"), // Array of team member objects
  
  // Use of Funds breakdown
  useOfFunds: jsonb("use_of_funds"), // Array of fund allocation objects with category, percentage, description
  
  // Business sector for categorization
  businessSector: varchar("business_sector"),
  
  // Social Media Links
  websiteUrl: varchar("website_url"),
  twitterUrl: varchar("twitter_url"),
  facebookUrl: varchar("facebook_url"),
  instagramUrl: varchar("instagram_url"),
  linkedinUrl: varchar("linkedin_url"),
  youtubeUrl: varchar("youtube_url"),
  mediumUrl: varchar("medium_url"),
  tiktokUrl: varchar("tiktok_url"),
  snapchatUrl: varchar("snapchat_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investments made by investors
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  investorId: varchar("investor_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, committed, paid, completed, cancelled
  paymentStatus: varchar("payment_status").notNull().default("pending"), // pending, processing, completed, failed
  paymentIntentId: varchar("payment_intent_id"), // Stripe payment intent ID
  agreementSigned: boolean("agreement_signed").notNull().default(false),
  signedAt: timestamp("signed_at"),
  ipAddress: varchar("ip_address"),
  notes: text("notes"), // Investment notes/comments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SAFE agreements generated for investments
export const safeAgreements = pgTable("safe_agreements", {
  id: serial("id").primaryKey(),
  investmentId: integer("investment_id").references(() => investments.id).notNull(),
  agreementId: varchar("agreement_id").unique().notNull(),
  documentUrl: varchar("document_url"),
  investorSignature: text("investor_signature"),
  founderSignature: text("founder_signature"),
  signedAt: timestamp("signed_at"),
  terms: jsonb("terms"), // Store SAFE terms like discount rate, valuation cap
  status: varchar("status").notNull().default("draft"), // draft, signed, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign updates posted by founders
export const campaignUpdates = pgTable("campaign_updates", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  attachmentUrls: jsonb("attachment_urls"), // Array of file URLs
  isPublic: boolean("is_public").notNull().default(true),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File uploads
export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  url: varchar("url").notNull(),
  type: varchar("type").notNull(), // pitch_deck, logo, profile_photo, safe_agreement
  createdAt: timestamp("created_at").defaultNow(),
});

// KYC verification data
export const kycVerifications = pgTable("kyc_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  status: varchar("status").notNull().default("not_started"), // not_started, under_review, verified, rejected
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  employmentStatus: varchar("employment_status"),
  annualIncome: varchar("annual_income"),
  investmentExperience: varchar("investment_experience"),
  riskTolerance: varchar("risk_tolerance"),
  governmentIdFiles: jsonb("government_id_files"), // Array of file references
  utilityBillFiles: jsonb("utility_bill_files"), // Array of file references
  otherDocumentFiles: jsonb("other_document_files"), // Array of file references
  rejectionReason: text("rejection_reason"),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin messages for in-app communication
export const adminMessages = pgTable("admin_messages", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
  recipientType: varchar("recipient_type").notNull(), // 'all', 'founders', 'investors', 'specific'
  recipientIds: jsonb("recipient_ids"), // Array of user IDs for specific recipients
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  category: varchar("category").notNull().default("general"), // 'general', 'announcement', 'update', 'reminder', 'security'
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  status: varchar("status").notNull().default("draft"), // 'draft', 'scheduled', 'sent'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  businessProfile: one(businessProfiles, {
    fields: [users.id],
    references: [businessProfiles.userId],
  }),
  campaigns: many(campaigns),
  investments: many(investments),
  fileUploads: many(fileUploads),
}));

export const businessProfilesRelations = relations(businessProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [businessProfiles.userId],
    references: [users.id],
  }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  founder: one(users, {
    fields: [campaigns.founderId],
    references: [users.id],
  }),
  businessProfile: one(businessProfiles, {
    fields: [campaigns.businessProfileId],
    references: [businessProfiles.id],
  }),
  investments: many(investments),
  updates: many(campaignUpdates),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [investments.campaignId],
    references: [campaigns.id],
  }),
  investor: one(users, {
    fields: [investments.investorId],
    references: [users.id],
  }),
  safeAgreement: one(safeAgreements, {
    fields: [investments.id],
    references: [safeAgreements.investmentId],
  }),
}));

export const safeAgreementsRelations = relations(safeAgreements, ({ one }) => ({
  investment: one(investments, {
    fields: [safeAgreements.investmentId],
    references: [investments.id],
  }),
}));

export const campaignUpdatesRelations = relations(campaignUpdates, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignUpdates.campaignId],
    references: [campaigns.id],
  }),
}));

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  user: one(users, {
    fields: [fileUploads.userId],
    references: [users.id],
  }),
}));

export const kycVerificationsRelations = relations(kycVerifications, ({ one }) => ({
  user: one(users, {
    fields: [kycVerifications.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = typeof kycVerifications.$inferInsert;

// Notifications table
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'update', 'investment', 'security', 'general'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: text("metadata"), // JSON string for additional data
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// OTP codes table for email-based 2FA
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  code: varchar("code").notNull(),
  type: varchar("type", { enum: ["email_2fa", "email_verification", "password_reset"] }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, {
    fields: [otpCodes.userId],
    references: [users.id],
  }),
}));

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = typeof otpCodes.$inferInsert;

// Withdrawal requests table for founder fund withdrawals
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  founderId: varchar("founder_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "completed"] }).notNull().default("pending"),
  bankName: varchar("bank_name").notNull(),
  bankAccount: varchar("bank_account").notNull(),
  routingNumber: varchar("routing_number"),
  swiftCode: varchar("swift_code"),
  iban: varchar("iban"),
  sortCode: varchar("sort_code"),
  bsb: varchar("bsb"),
  transitNumber: varchar("transit_number"),
  bankAddress: text("bank_address"),
  accountType: varchar("account_type"),
  country: varchar("country").notNull(),
  memo: text("memo"),
  adminNotes: text("admin_notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  founder: one(users, {
    fields: [withdrawalRequests.founderId],
    references: [users.id],
  }),
}));

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

// Update interactions table for likes and shares
export const updateInteractions = pgTable("update_interactions", {
  id: serial("id").primaryKey(),
  updateId: integer("update_id").references(() => campaignUpdates.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { enum: ["like", "share"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const updateInteractionsRelations = relations(updateInteractions, ({ one }) => ({
  update: one(campaignUpdates, {
    fields: [updateInteractions.updateId],
    references: [campaignUpdates.id],
  }),
  user: one(users, {
    fields: [updateInteractions.userId],
    references: [users.id],
  }),
}));

// Update replies table
export const updateReplies = pgTable("update_replies", {
  id: serial("id").primaryKey(),
  updateId: integer("update_id").references(() => campaignUpdates.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const updateRepliesRelations = relations(updateReplies, ({ one }) => ({
  update: one(campaignUpdates, {
    fields: [updateReplies.updateId],
    references: [campaignUpdates.id],
  }),
  user: one(users, {
    fields: [updateReplies.userId],
    references: [users.id],
  }),
}));

export type UpdateInteraction = typeof updateInteractions.$inferSelect;
export type InsertUpdateInteraction = typeof updateInteractions.$inferInsert;

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripePaymentMethodId: varchar("stripe_payment_method_id").notNull().unique(),
  type: varchar("type").notNull(), // 'card'
  cardBrand: varchar("card_brand"), // 'visa', 'mastercard', etc.
  cardLast4: varchar("card_last4").notNull(),
  cardExpMonth: integer("card_exp_month"),
  cardExpYear: integer("card_exp_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

// Notification preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  // Email notifications
  emailInvestmentUpdates: boolean("email_investment_updates").default(true),
  emailNewOpportunities: boolean("email_new_opportunities").default(true),
  emailSecurityAlerts: boolean("email_security_alerts").default(true),
  emailMarketingCommunications: boolean("email_marketing_communications").default(false),
  // Push notifications
  pushCampaignUpdates: boolean("push_campaign_updates").default(true),
  pushInvestmentReminders: boolean("push_investment_reminders").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;
export type UpdateReply = typeof updateReplies.$inferSelect;
export type InsertUpdateReply = typeof updateReplies.$inferInsert;

// Admin activity logs table
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // login, user_suspend, campaign_edit, withdrawal_approve, etc.
  targetType: varchar("target_type"), // user, campaign, investment, etc.
  targetId: varchar("target_id"), // ID of the affected entity
  details: jsonb("details"), // Additional context about the action
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

// Platform settings table for managing fees and KYC requirements
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  settingType: varchar("setting_type", { enum: ["string", "number", "boolean", "json"] }).notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'fees', 'kyc', 'general', etc.
  isEditable: boolean("is_editable").default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const platformSettingsRelations = relations(platformSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [platformSettings.updatedBy],
    references: [users.id],
  }),
}));

export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

// Admin messages exports
export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = typeof adminMessages.$inferInsert;

export const insertAdminMessageSchema = createInsertSchema(adminMessages);
export const adminMessageFormSchema = insertAdminMessageSchema.pick({
  recipientType: true,
  recipientIds: true,
  title: true,
  message: true,
  priority: true,
  category: true,
  scheduledFor: true,
});

// Campaign comments table
export const campaignComments = pgTable("campaign_comments", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isLeadInvestor: boolean("is_lead_investor").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaignCommentsRelations = relations(campaignComments, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignComments.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [campaignComments.userId],
    references: [users.id],
  }),
}));

export type CampaignComment = typeof campaignComments.$inferSelect;
export type InsertCampaignComment = typeof campaignComments.$inferInsert;

// Campaign questions table
export const campaignQuestions = pgTable("campaign_questions", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredBy: varchar("answered_by").references(() => users.id),
  answeredAt: timestamp("answered_at"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaignQuestionsRelations = relations(campaignQuestions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignQuestions.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [campaignQuestions.userId],
    references: [users.id],
  }),
  answeredByUser: one(users, {
    fields: [campaignQuestions.answeredBy],
    references: [users.id],
  }),
}));

export type CampaignQuestion = typeof campaignQuestions.$inferSelect;
export type InsertCampaignQuestion = typeof campaignQuestions.$inferInsert;

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  founderId: true,
  createdAt: true,
  updatedAt: true,
  privateLink: true,
}).extend({
  directors: z.array(z.object({
    name: z.string().min(1, "Director name is required"),
    title: z.string().min(1, "Director title is required"),
    nationality: z.string().min(1, "Nationality is required"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Valid email is required").optional(),
    phone: z.string().optional(),
  })).optional(),
});
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

export const insertSafeAgreementSchema = createInsertSchema(safeAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSafeAgreement = z.infer<typeof insertSafeAgreementSchema>;
export type SafeAgreement = typeof safeAgreements.$inferSelect;

export const insertCampaignUpdateSchema = createInsertSchema(campaignUpdates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCampaignUpdate = z.infer<typeof insertCampaignUpdateSchema>;
export type CampaignUpdate = typeof campaignUpdates.$inferSelect;

export const insertFileUploadSchema = createInsertSchema(fileUploads).omit({
  id: true,
  createdAt: true,
});
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;
export type FileUpload = typeof fileUploads.$inferSelect;
