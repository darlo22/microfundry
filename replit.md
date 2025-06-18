# Fundry - Equity Crowdfunding Platform

## Overview

Fundry is a full-stack equity crowdfunding platform built for Replit. It enables founders to create funding campaigns and allows investors to discover and invest in early-stage companies. The platform uses modern web technologies including React for the frontend, Express.js for the backend, PostgreSQL for data storage, and features Replit's authentication system.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React 18 with TypeScript, built using Vite for development and production
- **Backend**: Express.js server with TypeScript support
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Email/password authentication with Passport.js and PostgreSQL sessions
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **File Uploads**: Multer for handling campaign assets (logos, pitch decks)

## Key Components

### Frontend Architecture
- **React Router**: Using Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom Fundry brand colors (orange/navy theme)

### Backend Architecture
- **Express.js**: RESTful API server with middleware for authentication and logging
- **Database Layer**: Drizzle ORM with Neon serverless PostgreSQL
- **Authentication**: Passport.js with OpenID Connect for Replit authentication
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **File Storage**: Local file system storage for uploaded assets

### Database Schema
The database includes several key entities:
- **Users**: Stores user profiles with support for founders and investors
- **Business Profiles**: Extended information for founder accounts
- **Campaigns**: Funding campaigns with SAFE agreement terms
- **Investments**: Investment records with payment tracking
- **Sessions**: Authentication session storage

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth, creating sessions stored in PostgreSQL
2. **Campaign Creation**: Founders can create campaigns with file uploads for logos and pitch decks
3. **Investment Process**: Investors browse campaigns and make investments through SAFE agreements
4. **Dashboard Views**: Role-based dashboards showing relevant metrics and data for founders vs investors

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Comprehensive accessible UI primitives
- **passport**: Authentication middleware
- **multer**: File upload handling

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

The application is configured for deployment on Replit's autoscale infrastructure:

- **Development**: `npm run dev` runs the Express server with Vite middleware
- **Production Build**: `npm run build` creates optimized client bundle and server bundle
- **Production Runtime**: `npm run start` serves the built application
- **Database**: Managed PostgreSQL instance via environment variables
- **File Storage**: Local file system (uploads directory)

The deployment uses:
- Node.js 20 runtime
- PostgreSQL 16 for database
- Port 5000 for the application server
- Automatic SSL termination via Replit's proxy

## Changelog

- June 16, 2025. Initial setup
- June 16, 2025. Added comprehensive footer with About, Pricing pages and transparent fee structure (5% above $1,000, free below)
- June 16, 2025. Created extensive page ecosystem including Browse Campaigns, How It Works, Success Stories, Resources, Contact, Blog, Privacy Policy, Terms of Use, Cookie Policy, and Investment Disclaimer pages for professional platform presentation
- June 16, 2025. Fixed View button 404 errors by updating Browse Campaigns to use real API data instead of mock data, added sample campaigns to database (IDs 4, 5, 6), updated hero section "Learn More" button to navy blue text, and improved stats cards visibility with proper Fundry brand colors
- June 16, 2025. Complete authentication system overhaul: replaced Replit Auth with email/password authentication using Passport.js, created comprehensive onboarding modal with user type selection (founder/investor), implemented secure password hashing, PostgreSQL session storage, and role-based registration flow
- June 16, 2025. Enhanced campaign creation with exhaustive business sector options (36+ categories including AI/ML, Blockchain, CleanTech, Healthcare, FinTech, Manufacturing, etc.) for accurate startup categorization and improved investor filtering capabilities
- June 16, 2025. Major campaign view page enhancements: optimized logo display with proper scaling and white background, changed investment flow to "Commit to Invest" with payment later via dashboard, integrated real campaign data for Team and Traction sections, removed Company Photos section, added functional pitch deck modal viewer, improved navbar with Previous button and conditional Edit button for founders, enhanced error handling and user experience
- June 16, 2025. Connected Meet the Team and Business Model sections to live campaign data: enhanced team member display with LinkedIn profiles, added Market Opportunity and Competitive Landscape sections, removed all fallback content in favor of authentic founder-provided data
- June 16, 2025. Fixed production 404 errors for dashboard routes by adding catch-all handler for client-side routing and simplifying route structure to ensure all pages are accessible regardless of authentication state
- June 16, 2025. Enhanced Success Stories with custom SVG company logos, optimized startup logo display across campaign components, and implemented comprehensive case study pages with detailed timelines, results tracking, and social media sharing functionality for Twitter, LinkedIn, and Facebook
- June 16, 2025. Fixed Edit and Share buttons in Active Campaigns section by connecting them to functional modals, resolved $NaN display issue in raised amounts, enhanced team information display to show live campaign data with structured member profiles or text descriptions, and added downloadable SAFE agreement functionality in investment modal with prepopulated terms including investment amount, discount rate, and valuation cap
- June 16, 2025. Implemented team member photo capture functionality in Create New Campaign modal with file upload, preview, and removal capabilities; updated Success Stories page to comply with $5,000 funding limit across all case studies (TechFlow: $4,800, GreenEnergy: $5,000, HealthBridge: $3,200, EduPlatform: $1,800) maintaining platform consistency
- June 16, 2025. Integrated official Fundry logo across all platform pages with clickable navigation to home page: created reusable FundryLogo component using actual brand image, updated navbar, footer, and landing page for consistent branding throughout the application
- June 16, 2025. Enhanced Fundry logo implementation: increased logo size by 100% (h-10 to h-20) for better visibility and prominence, configured logo to always redirect to platform landing page (/landing route) regardless of user authentication status
- June 16, 2025. Enhanced investment flow with comprehensive authentication and investor details capture: added authentication step before SAFE Agreement Review requiring sign-in or account creation, implemented investor information collection with full contact details and investment experience, integrated role-based authentication supporting both founders and investors with automatic dashboard redirection, updated modal to use correct Fundry logo branding throughout authentication process
- June 16, 2025. Enhanced investor dashboard with functional Quick Actions, live data integration, and comprehensive tab navigation: created functional Discover, Documents, and Profile tab pages with relevant data connections, made Quick Actions buttons navigate to Browse Campaigns page and switch between dashboard tabs, connected stat cards to live data with clickable navigation, implemented complete investor dashboard experience with working functionality
- June 16, 2025. Updated pricing page structure and functionality: removed Enterprise pricing tier to focus on Free and Standard options, restructured layout for two-column grid design, made all "Start Campaign" buttons functional with onboarding modal integration, removed Enterprise CTA section while maintaining clear value proposition
- June 17, 2025. Fixed application startup issues by resolving port conflicts and restarting workflows, connected browse campaigns page to live data with proper category filtering based on businessSector field, removed excess zeros from Total Investors display and funding goal formatting, fixed blank section in pricing page by removing unnecessary whitespace
- June 17, 2025. Comprehensive legal documentation update: replaced Privacy Policy and Terms of Use with detailed, professional legal content including comprehensive risk disclosures, data collection and usage policies, investor disclaimers, platform role clarifications, and proper legal frameworks with numbered sections and emoji organization for improved readability
- June 17, 2025. Connected Recent Investors section to live database data: replaced mock data with actual investment records, filtered to only show committed/paid investments (not pending), implemented functional "View All Investors" modal with complete investor list, added proper empty states, and enhanced storage method to include investor names with firstName/lastName fields
- June 17, 2025. Completed comprehensive legal documentation suite: created Cookie Policy, Investment Disclaimer, SAFE Agreement Template, and Investor Accreditation pages with professional content, proper routing, and footer navigation integration; all legal pages now stable and persistent with detailed risk disclosures, regulatory information, and professional legal frameworks
- June 17, 2025. Implemented complete 7-step investment flow with proper authentication and data capture: created comprehensive investment process (Amount → Auth → SAFE Review → Terms → Signature → Payment → Confirmation) with progress indicators, investor authentication modal for step 2, real user data integration into SAFE Agreement preview, downloadable SAFE Agreement with populated investor information, and $25 minimum investment threshold
- June 17, 2025. Fixed logout functionality to properly redirect users to landing page after session termination instead of returning JSON response
- June 17, 2025. Resolved 404 error after logout by restructuring route configuration: made public routes always accessible, conditionally rendered authenticated routes, and improved fallback routing to show landing page for unauthenticated users instead of 404 errors
- June 17, 2025. Fixed text visibility issue in Learn More modal pricing section by enhancing background contrast and ensuring all text is properly visible with dark card backgrounds and white text throughout the pricing structure and examples table
- June 17, 2025. Implemented structured team member system in Edit Campaign modal: replaced textarea with individual team member cards supporting name, role, experience, LinkedIn profile, and photo uploads; fixed MulterError by updating server multer configuration to handle dynamic team member photo fields; updated Meet the Team section to display live team data with uploaded photos and LinkedIn integration
- June 17, 2025. Completed comprehensive percentage-based Use of Funds system: implemented structured fund allocation breakdown in both Create and Edit Campaign modals with category, percentage, and description fields; added real-time percentage tracking and validation; updated database schema and server routes to handle JSON fund allocation data; replaced text-based Use of Funds display with visual percentage breakdown showing categories, amounts, and progress bars in campaign view
- June 17, 2025. Enhanced team member photo visibility and persistence: improved photo preview in Edit Campaign modal with current photo display, added photo error handling with fallback initials in campaign view, implemented debug logging for photo URL tracking, and ensured photos remain stable and persistent across all interfaces
- June 17, 2025. Implemented comprehensive 2MB file size enforcement: added client-side validation with toast notifications for team member photos and company logos in both Create and Edit Campaign modals, enforced server-side file size limits for additional security, included user-friendly "Max size: 2MB" hints on all upload interfaces, and provided clear error handling when files exceed limits
- June 17, 2025. Created comprehensive founder dashboard ecosystem: built dedicated pages for Investors, Analytics, Settings, and Updates with full navigation integration; implemented investor management with stats overview and filtering capabilities; added analytics dashboard with charts and growth metrics; created settings page with personal, business, notification, and security tabs; built campaign updates system for founder-investor communication
- June 17, 2025. Implemented functional Compose Message modal in Investor Communications section: added comprehensive message composer with type selection (General Update, Milestone, Financial, Announcement, Newsletter), recipient filtering (All Investors, Active Only, Committed Only, Selected), live message preview, backend API endpoint for message sending with validation, and proper loading states with success/error notifications; fixed SelectItem empty value error in founder updates page by replacing empty string with "all" value; enhanced modal with scrollable layout using flex column design with 90% viewport height constraint, fixed header/footer positioning, and proper recipient validation with error handling for empty recipient lists; added complete file attachment system supporting images, videos, PDFs, and documents with 10MB file size limits, visual file previews, drag-and-drop interface, file type validation, and server-side multer processing for secure file handling; created navigation header for investors page with back button to founder dashboard, centered Fundry logo linking to landing page, and logout button for proper session management
- June 17, 2025. Implemented comprehensive worldwide location system: replaced single location field with separate country and state dropdowns featuring complete global coverage including 195+ countries with detailed state/province/region data for major countries (US, Canada, Australia, Brazil, India, UK, Germany, France, Italy, Spain, Mexico, Japan, China, South Africa, Nigeria, Argentina, Russia); added extensive countries-states data file with proper state handling for federal countries and clean implementation for smaller nations; updated database schema with new phone, country, state, and bio fields; created intelligent state dropdown that populates based on selected country with proper validation and user-friendly placeholders
- June 17, 2025. Created comprehensive Payment Withdrawal page with KYC verification and SAFE agreement management: implemented complete withdrawal system with account balance tracking, bank account setup, and transaction history; added KYC verification process with document upload, identity verification, and status tracking; created SAFE agreement template viewer with detailed terms and investor rights; connected all functionality to live backend data including founder earnings calculations, investment transaction history, and profile-based KYC status determination; added backend API endpoints for withdrawal requests, KYC submissions, and transaction tracking with proper authentication and validation
- June 17, 2025. Enhanced KYC verification system with comprehensive form validation and security requirements: fixed KYC form submission by switching from FormData to JSON format for better server processing; separated document upload fields into Government Issued ID, Utility Bill, and Other Documents with individual file size limits; implemented KYC verification requirement for withdrawal requests with proper user notifications; enhanced withdrawal button behavior to check KYC status on click and display appropriate messages; made withdrawal modal scrollable for better user experience with max-height constraints
- June 17, 2025. Completed real-time KYC status tracking system: implemented in-memory KYC submission storage for immediate status updates, fixed file upload serialization issues by converting File objects to descriptive strings, added automatic cache invalidation after successful KYC submission, and ensured withdrawal functionality properly validates KYC verification status before allowing fund withdrawals
- June 17, 2025. Enhanced KYC verification display with complete submitted information: integrated actual submitted data display on verification page showing all KYC form fields (date of birth, address, employment status, income level, investment experience, risk tolerance), implemented document upload confirmation with file counts, ensured "Under Review" status displays properly after submission, maintained data security by masking sensitive information like SSN, and provided complete transparency of submitted information for user verification tracking
- June 17, 2025. Fixed logout functionality to properly redirect users to landing page: replaced complex OIDC logout flow with simple session clearing and direct redirect to "/" route, ensuring users see the landing page after logout instead of encountering 404 errors; added React Query cache clearing before logout to prevent stale authentication state, updated routing structure to properly handle unauthenticated redirects, and ensured all logout buttons across the platform (navbar, founder updates) work consistently
- June 17, 2025. Enhanced sign-in modal with role-based authentication and routing: implemented two-step sign-in process with role selection (Founder/Investor) followed by credentials entry, added visual role selection cards with appropriate icons, implemented role-based dashboard routing that directs users to founder-dashboard or investor-dashboard based on selected role, included back navigation between steps and role indicator during sign-in form
- June 17, 2025. Removed logout buttons from founder dashboard sub-pages: deleted logout functionality from Payment Withdrawal, Investors, Analytics, Updates, and Settings pages to streamline navigation and maintain consistent header layout with only back button and Fundry logo
- June 17, 2025. Connected Discover Investment Opportunities to live data and removed dummy campaigns: ensured all campaign discovery pages use authentic data from /api/campaigns endpoint, deleted 3 mock campaigns from database (IDs 4-6 with demo founder accounts), maintaining only genuine campaigns created by real users for authentic investment opportunities
- June 17, 2025. Implemented comprehensive notifications system: created notifications database table with proper schema, built functional notification dropdown with unread count badges, integrated mark as read and mark all as read functionality, added real-time notification fetching with proper authentication, connected notification system to navbar across all dashboard pages, implemented notification type categorization (investment, update, security, general), added proper loading states and empty state handling
- June 17, 2025. Implemented functional Reply, Like, and Share buttons for Founders Updates page: added interactive Reply button that opens text area for composing responses, implemented Like button with heart icon that fills when liked and shows dynamic count, created Share button with native sharing API support and clipboard fallback, added proper state management for liked updates and reply interactions, included engagement stats display (views, replies) for each update, added visual feedback with color changes and hover effects, implemented toast notifications for all user actions
- June 17, 2025. Simplified investor dashboard navigation: removed Portfolio, Discover, Documents, and Profile menu items from top navigation, streamlined interface to show only Portfolio and Updates tabs for cleaner, more focused user experience
- June 17, 2025. Implemented comprehensive 2FA system with authenticator app and email support: created database schema with OTP codes table, built TwoFactorService with TOTP generation and QR codes, added complete API endpoints for 2FA setup and verification, integrated setup modal with both authentication methods, connected functionality to founder settings page with backup codes management
- June 17, 2025. Enhanced investor dashboard Profile page with functional Export and Deactivate buttons: implemented data export API that downloads comprehensive JSON file with user profile, investments, campaigns, and notifications; created secure account deactivation with confirmation modal requiring "DEACTIVATE" typing and reason selection; added proper authentication, validation, and safety measures for both features
- June 17, 2025. Removed Recent Investors section from campaign view page: eliminated investor listings, "View All Investors" functionality, and related helper functions for cleaner, more focused investment experience
- June 17, 2025. Fixed currency formatting issues throughout application: updated formatCurrency functions in campaign cards, campaign view, and share modals to properly display decimal places with consistent Intl.NumberFormat implementation showing amounts like $5,000 instead of $50000; replaced simple 2FA enable toggle with comprehensive setup modal requiring proper authenticator app or email verification before enabling two-factor authentication
- June 17, 2025. Connected founder dashboard stats to live analytics data: updated getFounderStats calculation to include 'committed', 'paid', and 'completed' investment statuses for accurate total raised amounts, enhanced stats cards with proper currency formatting using Intl.NumberFormat, implemented dynamic trend indicators based on actual data, fixed API endpoint queries to properly fetch founder campaigns and analytics with correct URL construction
- June 17, 2025. Connected founder investors page stats to live investment data: updated investment filtering to include committed, paid, and completed statuses, enhanced API endpoint to properly fetch founder campaign investments with investor details, implemented real-time calculation of total investors, total invested amounts, active investors, and average investment metrics using authentic database data
- June 17, 2025. Implemented investment flow continuation after authentication: added localStorage-based investment context persistence so users who authenticate during investment process continue their investment instead of being redirected to dashboard, enhanced both signup and signin flows in onboarding modal to check for active investment context and prevent unnecessary redirects, created comprehensive SAFE agreement generation with 6 detailed articles including definitions, conversion events, company/investor representations, and proper legal disclaimers
- June 17, 2025. Enhanced password security with visibility toggles and connected investor Updates to live data: added Eye/EyeOff icons to all password fields in sign-in and sign-up forms with proper state management and hover effects; implemented live data connection for investor Updates tab showing only real updates from founders the logged-in investor has invested in, created backend API endpoint `/api/campaign-updates/investor/:investorId` to fetch updates from invested campaigns, replaced mock data with authentic campaign updates including proper date formatting, update type categorization, and empty state handling for investors with no investments
- June 17, 2025. Connected investor dashboard top navigation to Quick Actions functionality: linked Discover menu item to browse campaigns navigation, connected Documents tab to investment documents with SAFE agreement downloads, integrated Profile navigation with account management settings, restructured tab system with proper handlers for seamless navigation between dashboard sections
- June 17, 2025. Restored Portfolio and Updates pages to investor dashboard: created comprehensive 5-tab navigation system (Portfolio, Discover, Updates, Documents, Profile), restored Portfolio as default landing page with investment overview and Quick Actions, maintained Updates tab with live founder communication data, ensured seamless navigation between all dashboard sections
- June 17, 2025. Fixed Documents page to display live SAFE agreement data: enhanced Documents tab with professional investment document cards showing real investment data, implemented filtering for committed/paid/completed investments, added Download and View functionality for SAFE agreements, created document summary statistics with total agreements and invested amounts, replaced empty state with authentic signed investment documents
- June 17, 2025. Removed top navigation menu items from investor dashboard: deleted Portfolio, Discover, Documents, and Profile navigation links from navbar header while preserving tab functionality within dashboard content area, maintaining clean header with only Fundry logo and user actions
- June 18, 2025. Implemented comprehensive email confirmation system: integrated Resend API for professional email delivery, created email verification tokens database table with 24-hour expiration, updated registration process to require email verification before account activation, added 3-step onboarding modal with email verification screen including resend functionality, enhanced login authentication to block unverified users, created branded HTML email templates for verification and welcome messages with proper styling and professional content, implemented complete backend API endpoints for sending, verifying, and resending verification emails with secure token management; configured email service to use verified microfundry.com domain (support@microfundry.com) with "Micro Fundry Support" branding for all onboarding verification and welcome messages ensuring professional delivery from company domain; verified email verification flow working correctly with proper token validation and user account activation
- June 18, 2025. Enhanced investor-founder connection validation system: strengthened API endpoint security to ensure investors only receive updates from campaigns they have confirmed investments in (committed, paid, completed statuses), added strict authorization checks preventing cross-investor data access, implemented campaign ownership verification for founders creating updates, added audit trail logging for investor update access and founder update creation, enhanced investment status filtering to exclude pending investments from update distribution, added metadata tracking for update reach and investor targeting
- June 18, 2025. Enhanced logo visibility with larger sizing across all platform components: increased FundryLogo component default size from h-40 to h-64, enlarged founder dashboard page logos from h-24 to h-48, updated payment withdrawal page logo from h-16 to h-32 for prominent, professional branding throughout the application
- June 18, 2025. Optimized founder dashboard logo sizing: reduced logo sizes by 3X across all founder admin dashboard pages (Updates, Investors, Settings, Analytics: h-96 to h-32; Payment Withdrawal: h-64 to h-21) for better visual balance and improved page layout proportions

## User Preferences

Preferred communication style: Simple, everyday language.