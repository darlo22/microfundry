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

// User storage table for email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  userType: varchar("user_type", { enum: ["founder", "investor"] }).notNull(),
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
  pitchDeckUrl: varchar("pitch_deck_url"),
  fundingGoal: decimal("funding_goal", { precision: 10, scale: 2 }).notNull(),
  minimumInvestment: decimal("minimum_investment", { precision: 10, scale: 2 }).notNull().default("25"),
  deadline: timestamp("deadline"),
  status: varchar("status").notNull().default("draft"), // draft, active, paused, closed, funded, cancelled
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).notNull().default("20"),
  valuationCap: decimal("valuation_cap", { precision: 15, scale: 2 }),
  privateLink: varchar("private_link").unique().notNull(),
  
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

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type BusinessProfile = typeof businessProfiles.$inferSelect;

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  privateLink: true,
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
