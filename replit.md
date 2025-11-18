# System Design Academy

A LeetCode-style System Design learning platform with interactive React Flow visual diagrams, XP/badge gamification system, submissions with auto-scoring, and admin tools.

## Overview

This is a full-stack TypeScript application built with:
- **Frontend**: React, Wouter routing, Tailwind CSS, shadcn/ui components, React Flow for diagram editor
- **Backend**: Express.js REST API with JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: Zustand for auth, React Query for data fetching

## Recent Changes (November 18, 2025)

### Completed Implementation
- ✅ Complete database schema with all tables (Users, Problems, Tags, Submissions, Comments, Badges, XPLog)
- ✅ Full JWT authentication system with bcrypt password hashing
- ✅ React Flow visual editor with 8+ draggable system design components
- ✅ Auto-scoring submission system based on required components
- ✅ XP awarding system (20 XP for correct solutions, +5 bonus for detailed explanations)
- ✅ Badge auto-awarding system (Cache Master, Load Balancer Guru, Scalability Ninja, etc.)
- ✅ Leaderboard with rankings and user stats
- ✅ Admin dashboard with CRUD for problems, analytics
- ✅ Responsive UI with Inter font and JetBrains Mono for code
- ✅ Seeded database with 5 sample problems and 6 achievement badges

## Project Architecture

### Frontend Structure
```
client/src/
├── components/
│   ├── navigation.tsx - Top navigation bar with auth status
│   ├── react-flow-editor.tsx - Visual diagram editor
│   └── ui/ - shadcn components
├── pages/
│   ├── home.tsx - Landing page
│   ├── login.tsx / register.tsx - Authentication
│   ├── problems.tsx - Problem library with filters
│   ├── problem-detail.tsx - Problem view with editor
│   ├── leaderboard.tsx - User rankings
│   ├── profile.tsx - User dashboard with badges
│   └── admin/ - Admin panel
└── lib/
    ├── auth-store.ts - Zustand auth state
    └── queryClient.ts - React Query setup with JWT headers
```

### Backend Structure
```
server/
├── routes.ts - All API endpoints with JWT middleware
├── storage.ts - Database operations (DatabaseStorage class)
├── db.ts - Drizzle database connection
└── seed.ts - Initial data seeding
```

### Database Tables
- **users** - User accounts with XP and role (learner/instructor/admin)
- **problems** - System design problems with MDX descriptions
- **tags** - Categorization tags
- **problemTags** - Many-to-many relation
- **submissions** - User solutions with diagram JSON and scores
- **comments** - Threaded discussions on problems
- **badges** - Achievement badges with XP requirements
- **userBadges** - Awarded badges per user
- **xpLogs** - XP transaction history

## Key Features

### 1. Authentication
- JWT-based authentication with 7-day token expiry
- Role-based access control (learner, instructor, admin)
- Secure password hashing with bcrypt

### 2. Problem Library
- 5 seeded problems: URL Shortener, Instagram, Chat App, Netflix, Twitter
- Difficulty levels: Easy, Medium, Hard
- Tag-based filtering
- Search functionality
- MDX-formatted problem descriptions

### 3. React Flow Editor
8 draggable components:
- Load Balancer (blue)
- Cache (yellow)
- Database (green)
- CDN (purple)
- Message Queue (orange)
- Blob Storage (pink)
- API Gateway (indigo)
- Microservice (teal)

Features: Zoom, pan, minimap, undo/redo, save/export

### 4. Scoring System
- Automatic scoring based on required components used
- Formula: `(used_required_components / total_required) * 100`
- XP rewards:
  - Score ≥ 80: 20 XP
  - Score ≥ 50: 10 XP
  - +5 bonus for detailed explanations (>100 chars)

### 5. Gamification
6 achievement badges:
- First Steps (20 XP) - Complete first submission
- Cache Master (100 XP) - Caching expertise
- Load Balancer Guru (150 XP) - Load balancing mastery
- Queue Architect (200 XP) - Messaging proficiency
- Scalability Ninja (500 XP) - System design mastery
- Rising Star (1000 XP) - Top performer

### 6. Leaderboard
- Ranked by XP
- Shows: Rank, User, XP, Problems Solved, Badges
- Top 3 featured with medal icons
- Highlights current user's position

### 7. Admin Dashboard
- Analytics: Total users, problems, submissions, badges awarded
- CRUD operations for problems
- Badge management
- User management (planned)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login with JWT
- `GET /api/auth/me` - Get current user

### Problems
- `GET /api/problems` - List all problems
- `GET /api/problems/:slug` - Get problem details

### Submissions
- `POST /api/submissions` - Submit solution (auto-scoring + XP)
- `GET /api/submissions` - User's submissions
- `GET /api/submissions/:problemId` - Problem-specific submissions

### Leaderboard & Users
- `GET /api/leaderboard` - Rankings
- `GET /api/users/:id` - User profile with badges

### Admin (requires admin role)
- `GET /api/admin/analytics` - Platform statistics
- `GET /api/admin/problems` - Problem management
- `POST /api/admin/problems` - Create problem
- `PUT /api/admin/problems/:id` - Update problem
- `DELETE /api/admin/problems/:id` - Delete problem
- `POST /api/admin/badges` - Create badge

### Comments
- `GET /api/comments/:problemId` - Get comments
- `POST /api/comments` - Add comment
- `POST /api/comments/:commentId/upvote` - Upvote

### Tags & Badges
- `GET /api/tags` - All tags
- `GET /api/badges` - All badges

## Environment Variables

Required secrets (already configured):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `SESSION_SECRET` - Session encryption key

## Default Admin Account

**Email**: admin@example.com  
**Password**: admin123

## Design System

- **Fonts**: Inter (UI), JetBrains Mono (code)
- **Colors**: Professional blue theme with proper light/dark mode support
- **Components**: shadcn/ui library with custom styling
- **Responsive**: Mobile-first design with breakpoints at sm, md, lg
- **Interactions**: Subtle hover elevations, smooth transitions

## User Preferences

- Clean, technical aesthetic inspired by LeetCode, Linear, and GitHub
- Minimalist design focused on content and learning
- Visual feedback for all interactions
- Clear hierarchy and spacing throughout

## Development Commands

```bash
npm run dev          # Start development server
npm run db:push      # Sync database schema
npx tsx server/seed.ts  # Seed database with sample data
```

## Project Status

**Current Phase**: Integration & Testing  
**Next Steps**: 
1. Architect review of implementation
2. End-to-end testing of core user journeys
3. Polish and bug fixes
4. Performance optimization

## Notes

- All routes except `/`, `/login`, `/register` require authentication
- Admin routes additionally require `role: 'admin'`
- JWT tokens stored in localStorage via Zustand persist
- React Flow diagrams saved as JSON in submissions
- Badge awarding happens automatically on XP milestones
