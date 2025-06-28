"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFileUploadSchema = exports.insertCampaignUpdateSchema = exports.insertSafeAgreementSchema = exports.insertInvestmentSchema = exports.insertCampaignSchema = exports.insertBusinessProfileSchema = exports.campaignQuestionsRelations = exports.campaignQuestions = exports.campaignCommentsRelations = exports.campaignComments = exports.adminMessageFormSchema = exports.insertAdminMessageSchema = exports.platformSettingsRelations = exports.platformSettings = exports.adminLogsRelations = exports.adminLogs = exports.notificationPreferencesRelations = exports.notificationPreferences = exports.paymentMethodsRelations = exports.paymentMethods = exports.updateRepliesRelations = exports.updateReplies = exports.updateInteractionsRelations = exports.updateInteractions = exports.withdrawalRequestsRelations = exports.withdrawalRequests = exports.otpCodesRelations = exports.otpCodes = exports.notificationsRelations = exports.notifications = exports.kycVerificationsRelations = exports.fileUploadsRelations = exports.campaignUpdatesRelations = exports.safeAgreementsRelations = exports.investmentsRelations = exports.campaignsRelations = exports.businessProfilesRelations = exports.usersRelations = exports.adminMessages = exports.kycVerifications = exports.fileUploads = exports.campaignUpdates = exports.safeAgreements = exports.investments = exports.campaigns = exports.businessProfiles = exports.users = exports.passwordResetTokens = exports.emailVerificationTokens = exports.sessions = void 0;
exports.insertContactManagementSchema = exports.insertEmailResponseSchema = exports.insertEmailReplySchema = exports.contactManagementRelations = exports.contactManagement = exports.emailAnalyticsRelations = exports.emailAnalytics = exports.emailResponsesRelations = exports.emailResponses = exports.emailRepliesRelations = exports.emailReplies = exports.insertFounderInvestorListSchema = exports.insertEmailTemplateSchema = exports.insertEmailCampaignSchema = exports.insertFounderEmailSettingsSchema = exports.insertInvestorDirectorySchema = exports.emailRateLimitingRelations = exports.emailRateLimiting = exports.founderInvestorListsRelations = exports.founderInvestorLists = exports.emailTemplatesRelations = exports.emailTemplates = exports.outreachEmailsRelations = exports.outreachEmails = exports.emailCampaignsRelations = exports.emailCampaigns = exports.founderEmailSettingsRelations = exports.founderEmailSettings = exports.investorDirectoryRelations = exports.investorDirectory = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const nanoid_1 = require("nanoid");
const drizzle_orm_1 = require("drizzle-orm");
// Session storage table for Replit Auth
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// Email verification tokens table
exports.emailVerificationTokens = (0, pg_core_1.pgTable)("email_verification_tokens", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    token: (0, pg_core_1.varchar)("token").notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Password reset tokens table
exports.passwordResetTokens = (0, pg_core_1.pgTable)("password_reset_tokens", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, nanoid_1.nanoid)()),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    token: (0, pg_core_1.varchar)("token").notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// User storage table for email/password authentication
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique().notNull(),
    password: (0, pg_core_1.varchar)("password"),
    firstName: (0, pg_core_1.varchar)("first_name").notNull(),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    userType: (0, pg_core_1.varchar)("user_type", { enum: ["founder", "investor", "admin"] }).notNull(),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    phone: (0, pg_core_1.varchar)("phone"),
    country: (0, pg_core_1.varchar)("country"),
    state: (0, pg_core_1.varchar)("state"),
    bio: (0, pg_core_1.text)("bio"),
    dateOfBirth: (0, pg_core_1.timestamp)("date_of_birth"),
    occupation: (0, pg_core_1.varchar)("occupation"),
    annualIncome: (0, pg_core_1.varchar)("annual_income"),
    investmentExperience: (0, pg_core_1.varchar)("investment_experience"),
    isEmailVerified: (0, pg_core_1.boolean)("is_email_verified").default(false),
    onboardingCompleted: (0, pg_core_1.boolean)("onboarding_completed").default(false),
    twoFactorEnabled: (0, pg_core_1.boolean)("two_factor_enabled").default(false),
    twoFactorSecret: (0, pg_core_1.varchar)("two_factor_secret"), // TOTP secret for authenticator apps
    twoFactorMethod: (0, pg_core_1.varchar)("two_factor_method", { enum: ["app", "email"] }), // Preferred 2FA method
    twoFactorBackupCodes: (0, pg_core_1.jsonb)("two_factor_backup_codes"), // Array of backup codes
    passwordLastChanged: (0, pg_core_1.timestamp)("password_last_changed").defaultNow(),
    stripeCustomerId: (0, pg_core_1.varchar)("stripe_customer_id"),
    status: (0, pg_core_1.varchar)("status", { enum: ["active", "suspended", "pending"] }).default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Business profiles for founders
exports.businessProfiles = (0, pg_core_1.pgTable)("business_profiles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    businessName: (0, pg_core_1.varchar)("business_name").notNull(),
    businessSector: (0, pg_core_1.varchar)("business_sector").notNull(),
    countryOfIncorporation: (0, pg_core_1.varchar)("country_of_incorporation").notNull(),
    yearOfFormation: (0, pg_core_1.integer)("year_of_formation"),
    businessAddress: (0, pg_core_1.text)("business_address"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Campaigns created by founders
exports.campaigns = (0, pg_core_1.pgTable)("campaigns", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").references(() => exports.users.id).notNull(),
    businessProfileId: (0, pg_core_1.integer)("business_profile_id").references(() => exports.businessProfiles.id),
    title: (0, pg_core_1.varchar)("title").notNull(),
    shortPitch: (0, pg_core_1.text)("short_pitch").notNull(),
    fullPitch: (0, pg_core_1.text)("full_pitch").notNull(),
    logoUrl: (0, pg_core_1.varchar)("logo_url"),
    pitchMediaUrl: (0, pg_core_1.varchar)("pitch_media_url"),
    pitchDeckUrl: (0, pg_core_1.varchar)("pitch_deck_url"),
    fundingGoal: (0, pg_core_1.decimal)("funding_goal", { precision: 10, scale: 2 }).notNull(),
    minimumInvestment: (0, pg_core_1.decimal)("minimum_investment", { precision: 10, scale: 2 }).notNull().default("25"),
    deadline: (0, pg_core_1.timestamp)("deadline"),
    status: (0, pg_core_1.varchar)("status").notNull().default("draft"), // draft, active, paused, closed, funded, cancelled
    discountRate: (0, pg_core_1.decimal)("discount_rate", { precision: 5, scale: 2 }).notNull().default("20"),
    valuationCap: (0, pg_core_1.decimal)("valuation_cap", { precision: 15, scale: 2 }),
    privateLink: (0, pg_core_1.varchar)("private_link").unique().notNull(),
    // Business Information
    companyName: (0, pg_core_1.varchar)("company_name"),
    country: (0, pg_core_1.varchar)("country"),
    state: (0, pg_core_1.varchar)("state"),
    businessAddress: (0, pg_core_1.text)("business_address"),
    registrationStatus: (0, pg_core_1.varchar)("registration_status"), // "registered" or "in-process"
    registrationType: (0, pg_core_1.varchar)("registration_type"),
    directors: (0, pg_core_1.jsonb)("directors"), // Array of director objects
    // Business Strategy Information
    problemStatement: (0, pg_core_1.text)("problem_statement"),
    solution: (0, pg_core_1.text)("solution"),
    marketOpportunity: (0, pg_core_1.text)("market_opportunity"),
    businessModel: (0, pg_core_1.text)("business_model"),
    goToMarketStrategy: (0, pg_core_1.text)("go_to_market_strategy"),
    competitiveLandscape: (0, pg_core_1.text)("competitive_landscape"),
    // Traction & Stage Information
    startupStage: (0, pg_core_1.varchar)("startup_stage"),
    currentRevenue: (0, pg_core_1.varchar)("current_revenue"),
    customers: (0, pg_core_1.varchar)("customers"),
    previousFunding: (0, pg_core_1.varchar)("previous_funding"),
    keyMilestones: (0, pg_core_1.text)("key_milestones"),
    // Team Information
    teamStructure: (0, pg_core_1.varchar)("team_structure").notNull().default("solo"), // solo, team
    teamMembers: (0, pg_core_1.jsonb)("team_members"), // Array of team member objects
    // Use of Funds breakdown
    useOfFunds: (0, pg_core_1.jsonb)("use_of_funds"), // Array of fund allocation objects with category, percentage, description
    // Business sector for categorization
    businessSector: (0, pg_core_1.varchar)("business_sector"),
    // Social Media Links
    websiteUrl: (0, pg_core_1.varchar)("website_url"),
    twitterUrl: (0, pg_core_1.varchar)("twitter_url"),
    facebookUrl: (0, pg_core_1.varchar)("facebook_url"),
    instagramUrl: (0, pg_core_1.varchar)("instagram_url"),
    linkedinUrl: (0, pg_core_1.varchar)("linkedin_url"),
    youtubeUrl: (0, pg_core_1.varchar)("youtube_url"),
    mediumUrl: (0, pg_core_1.varchar)("medium_url"),
    tiktokUrl: (0, pg_core_1.varchar)("tiktok_url"),
    snapchatUrl: (0, pg_core_1.varchar)("snapchat_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Investments made by investors
exports.investments = (0, pg_core_1.pgTable)("investments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    campaignId: (0, pg_core_1.integer)("campaign_id").references(() => exports.campaigns.id).notNull(),
    investorId: (0, pg_core_1.varchar)("investor_id").references(() => exports.users.id).notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    platformFee: (0, pg_core_1.decimal)("platform_fee", { precision: 10, scale: 2 }).notNull(),
    totalAmount: (0, pg_core_1.decimal)("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)("status").notNull().default("pending"), // pending, committed, paid, completed, cancelled
    paymentStatus: (0, pg_core_1.varchar)("payment_status").notNull().default("pending"), // pending, processing, completed, failed
    paymentIntentId: (0, pg_core_1.varchar)("payment_intent_id"), // Stripe payment intent ID
    agreementSigned: (0, pg_core_1.boolean)("agreement_signed").notNull().default(false),
    signedAt: (0, pg_core_1.timestamp)("signed_at"),
    ipAddress: (0, pg_core_1.varchar)("ip_address"),
    notes: (0, pg_core_1.text)("notes"), // Investment notes/comments
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// SAFE agreements generated for investments
exports.safeAgreements = (0, pg_core_1.pgTable)("safe_agreements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    investmentId: (0, pg_core_1.integer)("investment_id").references(() => exports.investments.id).notNull(),
    agreementId: (0, pg_core_1.varchar)("agreement_id").unique().notNull(),
    documentUrl: (0, pg_core_1.varchar)("document_url"),
    investorSignature: (0, pg_core_1.text)("investor_signature"),
    founderSignature: (0, pg_core_1.text)("founder_signature"),
    signedAt: (0, pg_core_1.timestamp)("signed_at"),
    terms: (0, pg_core_1.jsonb)("terms"), // Store SAFE terms like discount rate, valuation cap
    status: (0, pg_core_1.varchar)("status").notNull().default("draft"), // draft, signed, completed
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Campaign updates posted by founders
exports.campaignUpdates = (0, pg_core_1.pgTable)("campaign_updates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    campaignId: (0, pg_core_1.integer)("campaign_id").references(() => exports.campaigns.id).notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull().default("announcement"), // announcement, milestone, financial, progress
    attachmentUrls: (0, pg_core_1.jsonb)("attachment_urls"), // Array of file URLs
    views: (0, pg_core_1.integer)("views").notNull().default(0),
    isPublic: (0, pg_core_1.boolean)("is_public").notNull().default(true),
    scheduledFor: (0, pg_core_1.timestamp)("scheduled_for"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// File uploads
exports.fileUploads = (0, pg_core_1.pgTable)("file_uploads", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    filename: (0, pg_core_1.varchar)("filename").notNull(),
    originalName: (0, pg_core_1.varchar)("original_name").notNull(),
    mimeType: (0, pg_core_1.varchar)("mime_type").notNull(),
    size: (0, pg_core_1.integer)("size").notNull(),
    url: (0, pg_core_1.varchar)("url").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // pitch_deck, logo, profile_photo, safe_agreement
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// KYC verification data
exports.kycVerifications = (0, pg_core_1.pgTable)("kyc_verifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull().unique(),
    status: (0, pg_core_1.varchar)("status").notNull().default("not_started"), // not_started, under_review, verified, rejected
    dateOfBirth: (0, pg_core_1.timestamp)("date_of_birth"),
    address: (0, pg_core_1.text)("address"),
    city: (0, pg_core_1.varchar)("city"),
    state: (0, pg_core_1.varchar)("state"),
    zipCode: (0, pg_core_1.varchar)("zip_code"),
    employmentStatus: (0, pg_core_1.varchar)("employment_status"),
    annualIncome: (0, pg_core_1.varchar)("annual_income"),
    investmentExperience: (0, pg_core_1.varchar)("investment_experience"),
    riskTolerance: (0, pg_core_1.varchar)("risk_tolerance"),
    governmentIdFiles: (0, pg_core_1.jsonb)("government_id_files"), // Array of file references
    utilityBillFiles: (0, pg_core_1.jsonb)("utility_bill_files"), // Array of file references
    otherDocumentFiles: (0, pg_core_1.jsonb)("other_document_files"), // Array of file references
    rejectionReason: (0, pg_core_1.text)("rejection_reason"),
    reviewNotes: (0, pg_core_1.text)("review_notes"),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Admin messages for in-app communication
exports.adminMessages = (0, pg_core_1.pgTable)("admin_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    adminId: (0, pg_core_1.varchar)("admin_id").references(() => exports.users.id).notNull(),
    recipientType: (0, pg_core_1.varchar)("recipient_type").notNull(), // 'all', 'founders', 'investors', 'specific'
    recipientIds: (0, pg_core_1.jsonb)("recipient_ids"), // Array of user IDs for specific recipients
    title: (0, pg_core_1.varchar)("title").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    priority: (0, pg_core_1.varchar)("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
    category: (0, pg_core_1.varchar)("category").notNull().default("general"), // 'general', 'announcement', 'update', 'reminder', 'security'
    scheduledFor: (0, pg_core_1.timestamp)("scheduled_for"),
    sentAt: (0, pg_core_1.timestamp)("sent_at"),
    status: (0, pg_core_1.varchar)("status").notNull().default("draft"), // 'draft', 'scheduled', 'sent'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    businessProfile: one(exports.businessProfiles, {
        fields: [exports.users.id],
        references: [exports.businessProfiles.userId],
    }),
    campaigns: many(exports.campaigns),
    investments: many(exports.investments),
    fileUploads: many(exports.fileUploads),
}));
exports.businessProfilesRelations = (0, drizzle_orm_1.relations)(exports.businessProfiles, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.businessProfiles.userId],
        references: [exports.users.id],
    }),
    campaigns: many(exports.campaigns),
}));
exports.campaignsRelations = (0, drizzle_orm_1.relations)(exports.campaigns, ({ one, many }) => ({
    founder: one(exports.users, {
        fields: [exports.campaigns.founderId],
        references: [exports.users.id],
    }),
    businessProfile: one(exports.businessProfiles, {
        fields: [exports.campaigns.businessProfileId],
        references: [exports.businessProfiles.id],
    }),
    investments: many(exports.investments),
    updates: many(exports.campaignUpdates),
}));
exports.investmentsRelations = (0, drizzle_orm_1.relations)(exports.investments, ({ one }) => ({
    campaign: one(exports.campaigns, {
        fields: [exports.investments.campaignId],
        references: [exports.campaigns.id],
    }),
    investor: one(exports.users, {
        fields: [exports.investments.investorId],
        references: [exports.users.id],
    }),
    safeAgreement: one(exports.safeAgreements, {
        fields: [exports.investments.id],
        references: [exports.safeAgreements.investmentId],
    }),
}));
exports.safeAgreementsRelations = (0, drizzle_orm_1.relations)(exports.safeAgreements, ({ one }) => ({
    investment: one(exports.investments, {
        fields: [exports.safeAgreements.investmentId],
        references: [exports.investments.id],
    }),
}));
exports.campaignUpdatesRelations = (0, drizzle_orm_1.relations)(exports.campaignUpdates, ({ one }) => ({
    campaign: one(exports.campaigns, {
        fields: [exports.campaignUpdates.campaignId],
        references: [exports.campaigns.id],
    }),
}));
exports.fileUploadsRelations = (0, drizzle_orm_1.relations)(exports.fileUploads, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.fileUploads.userId],
        references: [exports.users.id],
    }),
}));
exports.kycVerificationsRelations = (0, drizzle_orm_1.relations)(exports.kycVerifications, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.kycVerifications.userId],
        references: [exports.users.id],
    }),
}));
// Notifications table
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.integer)("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    type: (0, pg_core_1.varchar)("type").notNull(), // 'update', 'investment', 'security', 'general'
    title: (0, pg_core_1.varchar)("title").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    isRead: (0, pg_core_1.boolean)("is_read").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    metadata: (0, pg_core_1.text)("metadata"), // JSON string for additional data
});
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.notifications.userId],
        references: [exports.users.id],
    }),
}));
// OTP codes table for email-based 2FA
exports.otpCodes = (0, pg_core_1.pgTable)("otp_codes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(),
    type: (0, pg_core_1.varchar)("type", { enum: ["email_2fa", "email_verification", "password_reset"] }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    used: (0, pg_core_1.boolean)("used").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.otpCodesRelations = (0, drizzle_orm_1.relations)(exports.otpCodes, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.otpCodes.userId],
        references: [exports.users.id],
    }),
}));
// Withdrawal requests table for founder fund withdrawals
exports.withdrawalRequests = (0, pg_core_1.pgTable)("withdrawal_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").references(() => exports.users.id).notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { enum: ["pending", "approved", "rejected", "completed"] }).notNull().default("pending"),
    bankName: (0, pg_core_1.varchar)("bank_name").notNull(),
    bankAccount: (0, pg_core_1.varchar)("bank_account").notNull(),
    routingNumber: (0, pg_core_1.varchar)("routing_number"),
    swiftCode: (0, pg_core_1.varchar)("swift_code"),
    iban: (0, pg_core_1.varchar)("iban"),
    sortCode: (0, pg_core_1.varchar)("sort_code"),
    bsb: (0, pg_core_1.varchar)("bsb"),
    transitNumber: (0, pg_core_1.varchar)("transit_number"),
    bankAddress: (0, pg_core_1.text)("bank_address"),
    accountType: (0, pg_core_1.varchar)("account_type"),
    country: (0, pg_core_1.varchar)("country").notNull(),
    memo: (0, pg_core_1.text)("memo"),
    adminNotes: (0, pg_core_1.text)("admin_notes"),
    processedAt: (0, pg_core_1.timestamp)("processed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.withdrawalRequestsRelations = (0, drizzle_orm_1.relations)(exports.withdrawalRequests, ({ one }) => ({
    founder: one(exports.users, {
        fields: [exports.withdrawalRequests.founderId],
        references: [exports.users.id],
    }),
}));
// Update interactions table for likes and shares
exports.updateInteractions = (0, pg_core_1.pgTable)("update_interactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    updateId: (0, pg_core_1.integer)("update_id").references(() => exports.campaignUpdates.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    type: (0, pg_core_1.varchar)("type", { enum: ["like", "share"] }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.updateInteractionsRelations = (0, drizzle_orm_1.relations)(exports.updateInteractions, ({ one }) => ({
    update: one(exports.campaignUpdates, {
        fields: [exports.updateInteractions.updateId],
        references: [exports.campaignUpdates.id],
    }),
    user: one(exports.users, {
        fields: [exports.updateInteractions.userId],
        references: [exports.users.id],
    }),
}));
// Update replies table
exports.updateReplies = (0, pg_core_1.pgTable)("update_replies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    updateId: (0, pg_core_1.integer)("update_id").references(() => exports.campaignUpdates.id).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.updateRepliesRelations = (0, drizzle_orm_1.relations)(exports.updateReplies, ({ one }) => ({
    update: one(exports.campaignUpdates, {
        fields: [exports.updateReplies.updateId],
        references: [exports.campaignUpdates.id],
    }),
    user: one(exports.users, {
        fields: [exports.updateReplies.userId],
        references: [exports.users.id],
    }),
}));
// Payment methods table
exports.paymentMethods = (0, pg_core_1.pgTable)("payment_methods", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    stripePaymentMethodId: (0, pg_core_1.varchar)("stripe_payment_method_id").notNull().unique(),
    type: (0, pg_core_1.varchar)("type").notNull(), // 'card'
    cardBrand: (0, pg_core_1.varchar)("card_brand"), // 'visa', 'mastercard', etc.
    cardLast4: (0, pg_core_1.varchar)("card_last4").notNull(),
    cardExpMonth: (0, pg_core_1.integer)("card_exp_month"),
    cardExpYear: (0, pg_core_1.integer)("card_exp_year"),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.paymentMethodsRelations = (0, drizzle_orm_1.relations)(exports.paymentMethods, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.paymentMethods.userId],
        references: [exports.users.id],
    }),
}));
// Notification preferences table
exports.notificationPreferences = (0, pg_core_1.pgTable)("notification_preferences", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }).unique(),
    // Email notifications
    emailInvestmentUpdates: (0, pg_core_1.boolean)("email_investment_updates").default(true),
    emailNewOpportunities: (0, pg_core_1.boolean)("email_new_opportunities").default(true),
    emailSecurityAlerts: (0, pg_core_1.boolean)("email_security_alerts").default(true),
    emailMarketingCommunications: (0, pg_core_1.boolean)("email_marketing_communications").default(false),
    // Push notifications
    pushCampaignUpdates: (0, pg_core_1.boolean)("push_campaign_updates").default(true),
    pushInvestmentReminders: (0, pg_core_1.boolean)("push_investment_reminders").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.notificationPreferencesRelations = (0, drizzle_orm_1.relations)(exports.notificationPreferences, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.notificationPreferences.userId],
        references: [exports.users.id],
    }),
}));
// Admin activity logs table
exports.adminLogs = (0, pg_core_1.pgTable)("admin_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    adminId: (0, pg_core_1.varchar)("admin_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    action: (0, pg_core_1.varchar)("action").notNull(), // login, user_suspend, campaign_edit, withdrawal_approve, etc.
    targetType: (0, pg_core_1.varchar)("target_type"), // user, campaign, investment, etc.
    targetId: (0, pg_core_1.varchar)("target_id"), // ID of the affected entity
    details: (0, pg_core_1.jsonb)("details"), // Additional context about the action
    ipAddress: (0, pg_core_1.varchar)("ip_address"),
    userAgent: (0, pg_core_1.varchar)("user_agent"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.adminLogsRelations = (0, drizzle_orm_1.relations)(exports.adminLogs, ({ one }) => ({
    admin: one(exports.users, {
        fields: [exports.adminLogs.adminId],
        references: [exports.users.id],
    }),
}));
// Platform settings table for managing fees and KYC requirements
exports.platformSettings = (0, pg_core_1.pgTable)("platform_settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    settingKey: (0, pg_core_1.varchar)("setting_key").notNull().unique(),
    settingValue: (0, pg_core_1.text)("setting_value").notNull(),
    settingType: (0, pg_core_1.varchar)("setting_type", { enum: ["string", "number", "boolean", "json"] }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category").notNull(), // 'fees', 'kyc', 'general', etc.
    isEditable: (0, pg_core_1.boolean)("is_editable").default(true),
    updatedBy: (0, pg_core_1.varchar)("updated_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.platformSettingsRelations = (0, drizzle_orm_1.relations)(exports.platformSettings, ({ one }) => ({
    updatedByUser: one(exports.users, {
        fields: [exports.platformSettings.updatedBy],
        references: [exports.users.id],
    }),
}));
exports.insertAdminMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.adminMessages);
exports.adminMessageFormSchema = exports.insertAdminMessageSchema.pick({
    recipientType: true,
    recipientIds: true,
    title: true,
    message: true,
    priority: true,
    category: true,
    scheduledFor: true,
});
// Campaign comments table
exports.campaignComments = (0, pg_core_1.pgTable)("campaign_comments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    campaignId: (0, pg_core_1.integer)("campaign_id").notNull().references(() => exports.campaigns.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    content: (0, pg_core_1.text)("content").notNull(),
    isLeadInvestor: (0, pg_core_1.boolean)("is_lead_investor").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.campaignCommentsRelations = (0, drizzle_orm_1.relations)(exports.campaignComments, ({ one }) => ({
    campaign: one(exports.campaigns, {
        fields: [exports.campaignComments.campaignId],
        references: [exports.campaigns.id],
    }),
    user: one(exports.users, {
        fields: [exports.campaignComments.userId],
        references: [exports.users.id],
    }),
}));
// Campaign questions table
exports.campaignQuestions = (0, pg_core_1.pgTable)("campaign_questions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    campaignId: (0, pg_core_1.integer)("campaign_id").notNull().references(() => exports.campaigns.id, { onDelete: "cascade" }),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    question: (0, pg_core_1.text)("question").notNull(),
    answer: (0, pg_core_1.text)("answer"),
    answeredBy: (0, pg_core_1.varchar)("answered_by").references(() => exports.users.id),
    answeredAt: (0, pg_core_1.timestamp)("answered_at"),
    isPublic: (0, pg_core_1.boolean)("is_public").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.campaignQuestionsRelations = (0, drizzle_orm_1.relations)(exports.campaignQuestions, ({ one }) => ({
    campaign: one(exports.campaigns, {
        fields: [exports.campaignQuestions.campaignId],
        references: [exports.campaigns.id],
    }),
    user: one(exports.users, {
        fields: [exports.campaignQuestions.userId],
        references: [exports.users.id],
    }),
    answeredByUser: one(exports.users, {
        fields: [exports.campaignQuestions.answeredBy],
        references: [exports.users.id],
    }),
}));
exports.insertBusinessProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.businessProfiles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.campaigns).omit({
    id: true,
    founderId: true,
    createdAt: true,
    updatedAt: true,
    privateLink: true,
}).extend({
    fundingGoal: zod_1.z.number().min(100, "Funding goal must be at least $100").max(100000, "Funding goal cannot exceed $100,000"),
    directors: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1, "Director name is required"),
        title: zod_1.z.string().min(1, "Director title is required"),
        nationality: zod_1.z.string().min(1, "Nationality is required"),
        address: zod_1.z.string().min(1, "Address is required"),
        email: zod_1.z.string().email("Valid email is required").optional(),
        phone: zod_1.z.string().optional(),
    })).optional(),
});
exports.insertInvestmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.investments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertSafeAgreementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.safeAgreements).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertCampaignUpdateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.campaignUpdates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertFileUploadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fileUploads).omit({
    id: true,
    createdAt: true,
});
// Investor Directory Table - Admin-curated list of investors
exports.investorDirectory = (0, pg_core_1.pgTable)("investor_directory", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    email: (0, pg_core_1.varchar)("email").notNull().unique(),
    company: (0, pg_core_1.varchar)("company"),
    title: (0, pg_core_1.varchar)("title"),
    investmentFocus: (0, pg_core_1.text)("investment_focus"), // Areas of interest
    minimumInvestment: (0, pg_core_1.decimal)("minimum_investment", { precision: 10, scale: 2 }),
    maximumInvestment: (0, pg_core_1.decimal)("maximum_investment", { precision: 10, scale: 2 }),
    location: (0, pg_core_1.varchar)("location"),
    linkedinUrl: (0, pg_core_1.varchar)("linkedin_url"),
    bio: (0, pg_core_1.text)("bio"),
    tags: (0, pg_core_1.text)("tags").array(), // Investment stages, sectors, etc.
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    addedBy: (0, pg_core_1.varchar)("added_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.investorDirectoryRelations = (0, drizzle_orm_1.relations)(exports.investorDirectory, ({ one }) => ({
    addedByUser: one(exports.users, {
        fields: [exports.investorDirectory.addedBy],
        references: [exports.users.id],
    }),
}));
// Founder Email Settings Table
exports.founderEmailSettings = (0, pg_core_1.pgTable)("founder_email_settings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }).unique(),
    verifiedEmail: (0, pg_core_1.varchar)("verified_email").notNull(),
    displayName: (0, pg_core_1.varchar)("display_name").notNull(),
    signature: (0, pg_core_1.text)("signature"),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
    verificationToken: (0, pg_core_1.varchar)("verification_token"),
    verificationExpiresAt: (0, pg_core_1.timestamp)("verification_expires_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.founderEmailSettingsRelations = (0, drizzle_orm_1.relations)(exports.founderEmailSettings, ({ one }) => ({
    founder: one(exports.users, {
        fields: [exports.founderEmailSettings.founderId],
        references: [exports.users.id],
    }),
}));
// Email Campaigns Table
exports.emailCampaigns = (0, pg_core_1.pgTable)("email_campaigns", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    campaignId: (0, pg_core_1.integer)("campaign_id").references(() => exports.campaigns.id),
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    recipientCount: (0, pg_core_1.integer)("recipient_count").default(0),
    sentCount: (0, pg_core_1.integer)("sent_count").default(0),
    deliveredCount: (0, pg_core_1.integer)("delivered_count").default(0),
    openedCount: (0, pg_core_1.integer)("opened_count").default(0),
    repliedCount: (0, pg_core_1.integer)("replied_count").default(0),
    status: (0, pg_core_1.varchar)("status", { enum: ["draft", "sending", "sent", "failed"] }).default("draft"),
    scheduledFor: (0, pg_core_1.timestamp)("scheduled_for"),
    sentAt: (0, pg_core_1.timestamp)("sent_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.emailCampaignsRelations = (0, drizzle_orm_1.relations)(exports.emailCampaigns, ({ one, many }) => ({
    founder: one(exports.users, {
        fields: [exports.emailCampaigns.founderId],
        references: [exports.users.id],
    }),
    campaign: one(exports.campaigns, {
        fields: [exports.emailCampaigns.campaignId],
        references: [exports.campaigns.id],
    }),
    emails: many(exports.outreachEmails),
}));
// Individual Outreach Emails Table
exports.outreachEmails = (0, pg_core_1.pgTable)("outreach_emails", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    emailCampaignId: (0, pg_core_1.integer)("email_campaign_id").notNull().references(() => exports.emailCampaigns.id, { onDelete: "cascade" }),
    recipientEmail: (0, pg_core_1.varchar)("recipient_email").notNull(),
    recipientName: (0, pg_core_1.varchar)("recipient_name"),
    recipientSource: (0, pg_core_1.varchar)("recipient_source", { enum: ["directory", "platform", "custom", "manual"] }).notNull(),
    personalizedSubject: (0, pg_core_1.varchar)("personalized_subject").notNull(),
    personalizedMessage: (0, pg_core_1.text)("personalized_message").notNull(),
    status: (0, pg_core_1.varchar)("status", { enum: ["pending", "sent", "delivered", "opened", "replied", "bounced", "failed"] }).default("pending"),
    sentAt: (0, pg_core_1.timestamp)("sent_at"),
    deliveredAt: (0, pg_core_1.timestamp)("delivered_at"),
    openedAt: (0, pg_core_1.timestamp)("opened_at"),
    repliedAt: (0, pg_core_1.timestamp)("replied_at"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    trackingId: (0, pg_core_1.varchar)("tracking_id").unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.outreachEmailsRelations = (0, drizzle_orm_1.relations)(exports.outreachEmails, ({ one }) => ({
    emailCampaign: one(exports.emailCampaigns, {
        fields: [exports.outreachEmails.emailCampaignId],
        references: [exports.emailCampaigns.id],
    }),
}));
// Email Templates Table
exports.emailTemplates = (0, pg_core_1.pgTable)("email_templates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    category: (0, pg_core_1.varchar)("category", { enum: ["introduction", "follow_up", "pitch", "update", "custom"] }).notNull(),
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    variables: (0, pg_core_1.text)("variables").array(), // Available merge fields
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    isPublic: (0, pg_core_1.boolean)("is_public").default(true),
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.emailTemplatesRelations = (0, drizzle_orm_1.relations)(exports.emailTemplates, ({ one }) => ({
    createdByUser: one(exports.users, {
        fields: [exports.emailTemplates.createdBy],
        references: [exports.users.id],
    }),
}));
// Founder Custom Investor Lists Table
exports.founderInvestorLists = (0, pg_core_1.pgTable)("founder_investor_lists", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    investors: (0, pg_core_1.jsonb)("investors").notNull(), // Array of investor objects
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.founderInvestorListsRelations = (0, drizzle_orm_1.relations)(exports.founderInvestorLists, ({ one }) => ({
    founder: one(exports.users, {
        fields: [exports.founderInvestorLists.founderId],
        references: [exports.users.id],
    }),
}));
// Rate Limiting Table
exports.emailRateLimiting = (0, pg_core_1.pgTable)("email_rate_limiting", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    date: (0, pg_core_1.varchar)("date").notNull(), // YYYY-MM-DD format
    emailsSent: (0, pg_core_1.integer)("emails_sent").default(0),
    lastEmailAt: (0, pg_core_1.timestamp)("last_email_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.emailRateLimitingRelations = (0, drizzle_orm_1.relations)(exports.emailRateLimiting, ({ one }) => ({
    founder: one(exports.users, {
        fields: [exports.emailRateLimiting.founderId],
        references: [exports.users.id],
    }),
}));
// Schema validation for forms
exports.insertInvestorDirectorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.investorDirectory).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertFounderEmailSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.founderEmailSettings).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertEmailCampaignSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailCampaigns).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertEmailTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailTemplates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertFounderInvestorListSchema = (0, drizzle_zod_1.createInsertSchema)(exports.founderInvestorLists).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
// Email Replies Table - Track responses from investors
exports.emailReplies = (0, pg_core_1.pgTable)("email_replies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    originalEmailId: (0, pg_core_1.integer)("original_email_id"),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    replyEmail: (0, pg_core_1.varchar)("reply_email"),
    replyName: (0, pg_core_1.varchar)("reply_name"),
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    content: (0, pg_core_1.text)("content"),
    replyType: (0, pg_core_1.varchar)("reply_type"),
    tags: (0, pg_core_1.text)("tags").array(),
    isRead: (0, pg_core_1.boolean)("is_read").default(false),
    campaignName: (0, pg_core_1.varchar)("campaign_name"),
    receivedAt: (0, pg_core_1.timestamp)("received_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    senderEmail: (0, pg_core_1.varchar)("sender_email").notNull(),
    senderName: (0, pg_core_1.varchar)("sender_name"),
    readAt: (0, pg_core_1.timestamp)("read_at"),
    archivedAt: (0, pg_core_1.timestamp)("archived_at"),
    outreachEmailId: (0, pg_core_1.integer)("outreach_email_id"),
    campaignId: (0, pg_core_1.integer)("campaign_id").references(() => exports.campaigns.id),
    message: (0, pg_core_1.text)("message").notNull(),
    sentiment: (0, pg_core_1.varchar)("sentiment", { enum: ["positive", "negative", "neutral", "interested"] }),
    category: (0, pg_core_1.varchar)("category", { enum: ["interest", "question", "rejection", "meeting_request", "follow_up", "other"] }),
    priority: (0, pg_core_1.varchar)("priority", { enum: ["high", "medium", "low"] }).default("medium"),
    isStarred: (0, pg_core_1.boolean)("is_starred").default(false),
    isArchived: (0, pg_core_1.boolean)("is_archived").default(false),
    respondedAt: (0, pg_core_1.timestamp)("responded_at"),
});
exports.emailRepliesRelations = (0, drizzle_orm_1.relations)(exports.emailReplies, ({ one, many }) => ({
    outreachEmail: one(exports.outreachEmails, {
        fields: [exports.emailReplies.outreachEmailId],
        references: [exports.outreachEmails.id],
    }),
    founder: one(exports.users, {
        fields: [exports.emailReplies.founderId],
        references: [exports.users.id],
    }),
    campaign: one(exports.campaigns, {
        fields: [exports.emailReplies.campaignId],
        references: [exports.campaigns.id],
    }),
    responses: many(exports.emailResponses),
}));
// Email Responses Table - Track founder's responses to investor replies
exports.emailResponses = (0, pg_core_1.pgTable)("email_responses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    emailReplyId: (0, pg_core_1.integer)("email_reply_id").notNull().references(() => exports.emailReplies.id, { onDelete: "cascade" }),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    messageId: (0, pg_core_1.varchar)("message_id"), // Email message ID
    threadId: (0, pg_core_1.varchar)("thread_id"), // Email thread ID
    status: (0, pg_core_1.varchar)("status", { enum: ["draft", "sent", "failed"] }).default("draft"),
    sentAt: (0, pg_core_1.timestamp)("sent_at"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    attachments: (0, pg_core_1.jsonb)("attachments"), // Array of attachment info
    scheduledFor: (0, pg_core_1.timestamp)("scheduled_for"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.emailResponsesRelations = (0, drizzle_orm_1.relations)(exports.emailResponses, ({ one }) => ({
    emailReply: one(exports.emailReplies, {
        fields: [exports.emailResponses.emailReplyId],
        references: [exports.emailReplies.id],
    }),
    founder: one(exports.users, {
        fields: [exports.emailResponses.founderId],
        references: [exports.users.id],
    }),
}));
// Email Analytics Table - Track detailed email metrics
exports.emailAnalytics = (0, pg_core_1.pgTable)("email_analytics", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    emailCampaignId: (0, pg_core_1.integer)("email_campaign_id").references(() => exports.emailCampaigns.id),
    outreachEmailId: (0, pg_core_1.integer)("outreach_email_id").references(() => exports.outreachEmails.id),
    eventType: (0, pg_core_1.varchar)("event_type", { enum: ["sent", "delivered", "opened", "clicked", "replied", "bounced", "unsubscribed"] }).notNull(),
    eventData: (0, pg_core_1.jsonb)("event_data"), // Additional event metadata
    ipAddress: (0, pg_core_1.varchar)("ip_address"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    location: (0, pg_core_1.varchar)("location"),
    deviceType: (0, pg_core_1.varchar)("device_type", { enum: ["desktop", "mobile", "tablet", "unknown"] }),
    timestamp: (0, pg_core_1.timestamp)("timestamp").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.emailAnalyticsRelations = (0, drizzle_orm_1.relations)(exports.emailAnalytics, ({ one }) => ({
    founder: one(exports.users, {
        fields: [exports.emailAnalytics.founderId],
        references: [exports.users.id],
    }),
    emailCampaign: one(exports.emailCampaigns, {
        fields: [exports.emailAnalytics.emailCampaignId],
        references: [exports.emailCampaigns.id],
    }),
    outreachEmail: one(exports.outreachEmails, {
        fields: [exports.emailAnalytics.outreachEmailId],
        references: [exports.outreachEmails.id],
    }),
}));
// Contact Management Table - Track investor contact information and interactions
exports.contactManagement = (0, pg_core_1.pgTable)("contact_management", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    founderId: (0, pg_core_1.varchar)("founder_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    email: (0, pg_core_1.varchar)("email").notNull(),
    name: (0, pg_core_1.varchar)("name"),
    company: (0, pg_core_1.varchar)("company"),
    title: (0, pg_core_1.varchar)("title"),
    phone: (0, pg_core_1.varchar)("phone"),
    linkedinUrl: (0, pg_core_1.varchar)("linkedin_url"),
    source: (0, pg_core_1.varchar)("source", { enum: ["directory", "platform", "manual", "import", "referral"] }).notNull(),
    relationship: (0, pg_core_1.varchar)("relationship", { enum: ["prospect", "contacted", "responded", "meeting_scheduled", "invested", "rejected"] }).default("prospect"),
    investmentInterest: (0, pg_core_1.text)("investment_interest"),
    notes: (0, pg_core_1.text)("notes"),
    tags: (0, pg_core_1.text)("tags").array(),
    lastContactedAt: (0, pg_core_1.timestamp)("last_contacted_at"),
    lastResponseAt: (0, pg_core_1.timestamp)("last_response_at"),
    totalEmailsSent: (0, pg_core_1.integer)("total_emails_sent").default(0),
    totalRepliesReceived: (0, pg_core_1.integer)("total_replies_received").default(0),
    averageResponseTime: (0, pg_core_1.integer)("average_response_time"), // in hours
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    isBlacklisted: (0, pg_core_1.boolean)("is_blacklisted").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.contactManagementRelations = (0, drizzle_orm_1.relations)(exports.contactManagement, ({ one }) => ({
    founder: one(exports.users, {
        fields: [exports.contactManagement.founderId],
        references: [exports.users.id],
    }),
}));
// Schema validation for forms
exports.insertEmailReplySchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailReplies).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertEmailResponseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emailResponses).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertContactManagementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contactManagement).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
