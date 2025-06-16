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

## User Preferences

Preferred communication style: Simple, everyday language.