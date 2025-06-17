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

## User Preferences

Preferred communication style: Simple, everyday language.