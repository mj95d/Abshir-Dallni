# Dalleni - AI Government Services Assistant

## Overview

Dalleni is a bilingual (Arabic/English) AI-powered personal assistant designed specifically for Saudi Arabian government services. The application helps users navigate official procedures, check for data breaches, track service renewals, and receive step-by-step guidance for government and daily services. Built as a full-stack web application with modern React frontend and Express backend, it emphasizes cultural appropriateness, institutional trust, and seamless bilingual support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript for type-safe component development
- Vite for fast development and optimized production builds
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS for utility-first styling with custom design system

**UI Component System:**
- Shadcn/ui (New York variant) for accessible, customizable components
- Radix UI primitives for unstyled, accessible component foundation
- Custom theme system supporting light/dark modes with CSS variables
- Responsive design with mobile-first approach

**Internationalization:**
- Context-based language system (LanguageContext) supporting Arabic and English
- RTL/LTR layout switching based on language selection
- Typography: IBM Plex Sans Arabic for Arabic text, Inter for English
- Complete translation dictionary stored in client-side context

**Key Features:**
- AI chat interface with conversation history
- Data breach monitoring via HIBP API integration
- Service category browser with detailed government service information
- User dashboard for saved inquiries and recent searches
- Mobile-optimized navigation with bottom tab bar

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety across server code
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary relational database

**API Design:**
- RESTful endpoints for data operations
- `/api/chat` - AI conversation endpoint using OpenAI
- `/api/breach-check` - Data breach monitoring via HIBP API
- Session-based conversation tracking with unique session IDs
- Request/response logging middleware for debugging

**AI Integration:**
- OpenAI client configured with environment-based API keys
- Specialized system prompts for Saudi government services (English and Arabic variants)
- Context-aware responses for services like Absher, Nafath, Tawakkalna, etc.
- Language detection and appropriate response generation

**Data Storage Layer:**
- DatabaseStorage class implementing IStorage interface
- Separation of concerns between storage logic and route handlers
- Type-safe database queries using Drizzle ORM
- Schema-first approach with shared types between frontend and backend

### Database Schema

**Core Tables:**
- `users` - User accounts with language preferences
- `saved_inquiries` - User-saved service inquiries with categorization
- `breach_monitors` - Email addresses monitored for data breaches with status
- `chat_messages` - Conversation history linked to sessions

**Design Decisions:**
- UUID primary keys for distributed system compatibility
- JSONB for flexible breach details storage
- Timestamps for audit trails and temporal queries
- Foreign key relationships for data integrity

### Design System

**Material Design Adaptation:**
- System-based design principles adapted for Saudi Arabian government context
- Institutional color palette emphasizing trust (primary green matching Saudi identity)
- Consistent spacing system using Tailwind units (4, 6, 8, 12, 16)
- Elevation system for visual hierarchy (hover-elevate, active-elevate-2 classes)

**Responsive Breakpoints:**
- Mobile: < 768px with bottom navigation
- Desktop: ≥ 768px with header navigation
- Container max-widths: 7xl for main layout, 4xl for chat, 2xl for forms

### Build and Deployment

**Build Process:**
- Custom build script (script/build.ts) using esbuild for server, Vite for client
- Server dependencies selectively bundled to reduce cold start times
- Allowlist of dependencies to bundle vs. mark as external
- Separate dist directories for client (public) and server (index.cjs)

**Development Workflow:**
- Hot Module Replacement (HMR) via Vite in development
- Replit-specific plugins for runtime error overlay and cartographer
- TypeScript checking without emit (noEmit: true)
- Path aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### Third-Party APIs

**OpenAI API:**
- Purpose: AI-powered conversational assistant for government service guidance
- Configuration: Environment variables AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY
- Optional base URL override for custom endpoints
- Model: gpt-5 (latest as of implementation)

**Have I Been Pwned (HIBP) API:**
- Purpose: Data breach monitoring for user emails
- Configuration: HIBP_API_KEY environment variable
- Endpoint: https://haveibeenpwned.com/api/v3
- Returns breach history with severity classification (high/medium/low)

### Database

**PostgreSQL:**
- Configuration: DATABASE_URL environment variable
- Connection pooling via pg.Pool
- Schema migrations managed through Drizzle Kit
- Required for application functionality

### UI Component Libraries

**Radix UI:**
- Comprehensive set of unstyled, accessible primitives
- Accordion, Dialog, Dropdown, Popover, Tooltip, and 20+ other components
- Handles accessibility, keyboard navigation, and ARIA attributes

**Additional UI Dependencies:**
- class-variance-authority: Type-safe component variants
- clsx & tailwind-merge: Conditional className utilities
- cmdk: Command palette component
- embla-carousel-react: Touch-friendly carousels
- lucide-react: Icon library with 1000+ icons

### Development Dependencies

**Vite Plugins (Replit-specific):**
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Code mapping for debugging
- @replit/vite-plugin-dev-banner: Development environment indicator

### Font Resources

**Google Fonts CDN:**
- IBM Plex Sans Arabic: Arabic typography (weights 300-700)
- Inter: English typography with variable font support
- Preconnect optimization for faster font loading