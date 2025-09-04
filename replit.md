# OfinaPulse Smart Dental Unified Messenger V2

## Overview

OfinaPulse is a comprehensive dental practice management platform that unifies multi-channel communication, appointment scheduling, task management, and analytics into a single intelligent dashboard. Built specifically for dental practices, it centralizes interactions from Facebook Messenger, Instagram Direct Messages, and Gmail while providing AI-powered automation, ElevenLabs voice agent integration, and comprehensive practice analytics.

The platform serves as a central hub for dental offices to manage patient communications, appointments, and operational tasks through a modern web interface built with Next.js 15 and React 19.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router for server-side rendering and routing
- **UI Library**: React 19 with TypeScript for type safety
- **Styling**: Tailwind CSS 4 with custom design system using shadcn/ui components
- **State Management**: Zustand for client-side state with React Query for server state
- **Theme System**: Enforced light theme with custom useLightTheme hook to prevent dark mode
- **Responsive Design**: Mobile-first approach with custom useResponsive hook

### Backend Architecture
- **API Routes**: Next.js API routes for serverless function handling
- **Database Layer**: PostgreSQL with direct pg client connections, prepared for Drizzle ORM migration
- **Authentication**: NextAuth.js with multiple providers (Credentials, Google, Facebook)
- **Session Management**: JWT-based sessions with secure cookie storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL for core application data (users, messages, tasks, appointments)
- **Message Storage**: Dedicated tables for platform-specific messages (facebook_messages, instagram_messages)
- **Session Store**: Database-backed session storage for authentication persistence
- **File Storage**: Prepared for attachment handling via external storage providers

### Authentication and Authorization
- **Multi-Provider Auth**: NextAuth.js supporting email/password, Google OAuth, and Facebook OAuth
- **Password Security**: bcryptjs for password hashing with salt rounds
- **Role-Based Access**: User role system for admin, editor, and viewer permissions
- **API Authentication**: Bearer token authentication for API endpoints

### External Dependencies

#### Social Media Integrations
- **Facebook Graph API v23.0**: Message retrieval, conversation management, and auto-reply functionality
- **Instagram Business API**: Direct message handling through Graph API integration
- **Webhook Endpoints**: Real-time message receiving via Facebook/Instagram webhooks

#### Email Integration
- **Gmail API**: Full email management (read, send, reply) via Google APIs
- **OAuth 2.0**: Secure Google authentication with refresh token management
- **IMAP/SMTP**: Fallback email protocols for broader email provider support

#### AI and Automation
- **ElevenLabs Voice API**: AI voice agent for automated phone call handling and transcription
- **N8N Webhook Integration**: Workflow automation for AI-powered message processing and responses
- **Custom AI Training**: Platform-specific AI response generation for dental practice scenarios

#### Communication APIs
- **Socket.io Client**: Real-time message synchronization and live updates
- **Axios**: HTTP client for external API communications
- **Facebook Business SDK**: Enhanced Facebook API integration with business features

#### Analytics and Monitoring
- **Chart.js with React-ChartJS-2**: Comprehensive dashboard analytics and data visualization
- **Custom Analytics Engine**: Practice performance metrics, appointment tracking, and communication analytics
- **Real-time Data**: Live statistics updates for calls, messages, and appointments

#### Development and Deployment
- **TypeScript**: Full type safety across frontend and backend
- **ESLint**: Code quality and consistency enforcement
- **TailwindCSS PostCSS**: Advanced CSS processing and optimization
- **Next.js Build System**: Optimized production builds with automatic code splitting