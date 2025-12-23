# System Patterns: SeeMyCampus

## Architecture Overview

### Application Architecture
- **Pattern**: Next.js App Router with Server Components
- **API**: RESTful API routes in `app/api/`
- **State Management**: React Server Components + Client Components where needed
- **Data Fetching**: Server-side data fetching with Drizzle ORM

### Database Schema Patterns

#### Core Entities
1. **Colleges**: Main institution data with comprehensive fields (ranking, fees, placement, etc.)
2. **Courses**: Course offerings linked to colleges
3. **Users**: Authentication and user profiles (NextAuth) with role field (admin/student)
4. **Student Answers**: Quiz responses and preferences, linked to userId if logged in
5. **Leads**: Captured student leads with status tracking
6. **Saved Colleges**: User's favorite colleges (userId + collegeId)
7. **Scholarships**: Scholarship information with provider, amount, eligibility, deadlines
8. **College Reviews**: User-generated reviews with verification
9. **Categories & Menu Courses**: Navigation menu structure
10. **Hero Slides**: Homepage carousel content
11. **Testimonials**: Student testimonials
12. **Study Goals**: Predefined study goal categories
13. **Entrance Exams**: Exam information and dates

#### Key Relationships
- Colleges → Courses (one-to-many)
- Colleges → Reviews (one-to-many)
- Colleges → Saved Colleges (one-to-many)
- Colleges → Scholarships (one-to-many, optional)
- Student Answers → Leads (one-to-one)
- Student Answers → Users (many-to-one, optional)
- Users → Student Answers (one-to-many)
- Users → Saved Colleges (one-to-many)
- Users → Reviews (one-to-many)
- Categories → Menu Courses (one-to-many)

### Component Patterns

#### Layout Components
- **ConditionalLayout**: Wraps pages with appropriate layout
- **Header/HeaderClient**: Navigation with client-side interactivity
- **Footer**: Site footer with links
- **Sidebar**: Dashboard navigation

#### Feature Components
- **QuizForm**: Multi-step quiz for preferences
- **ChatInterface**: AI chatbot interface
- **CollegeCard**: College display card with save/compare functionality
- **RecommendationList**: Display recommended colleges
- **LeadsList**: Admin lead management
- **StudentDashboardClient**: Student dashboard with tabs
- **SavedCollegesTab**: Display and manage saved colleges
- **QuizHistoryTab**: Display quiz history
- **RecommendationsTab**: Display recommendation history
- **CollegeComparison**: Side-by-side college comparison tool
- **ScholarshipsListClient**: Public scholarships listing with search/filters
- **ScholarshipCard**: Scholarship display card
- **ScholarshipsList**: Admin scholarships management
- **ScholarshipForm**: Admin scholarship form (CRUD)
- **FeeCalculatorClient**: Interactive fee calculator component

### API Route Patterns

#### RESTful Conventions
- `GET /api/colleges` - List colleges
- `GET /api/colleges/[id]` - Get college details
- `POST /api/colleges` - Create college
- `PUT /api/colleges/[id]` - Update college
- `DELETE /api/colleges/[id]` - Delete college

#### Special Routes
- `/api/quiz/submit` - Submit quiz and generate recommendations (links to user if logged in)
- `/api/quiz/results` - Get recommendations for a quiz ID
- `/api/chat` - AI chatbot endpoint
- `/api/leads` - Lead management
- `/api/colleges/search` - College search
- `/api/colleges/[slug]/reviews` - College reviews
- `/api/student/saved-colleges` - Student saved colleges (GET, POST, DELETE)
- `/api/student/quiz-history` - Student quiz history
- `/api/scholarships` - Public scholarships listing (GET with filters, POST)
- `/api/scholarships/[slug]` - Get scholarship by slug
- `/api/dashboard/scholarships` - Admin scholarships management (GET, POST)
- `/api/dashboard/scholarships/[id]` - Admin scholarship CRUD (GET, PUT, DELETE)

### AI Integration Pattern

#### Provider Abstraction
- Base `AIProvider` interface
- Provider implementations (Custom, OpenAI)
- Chatbot class wrapping provider
- System prompts and safety checks

#### Recommendation Engine
- Scoring algorithm based on quiz answers
- Multi-factor matching (location, budget, interests, etc.)
- Top N recommendations with scores

### SEO Patterns

#### Meta Tag Generation
- Dynamic metadata per page
- Open Graph tags
- Twitter cards
- Canonical URLs
- Structured data (to be enhanced in Phase 2)

#### URL Structure
- `/colleges/[slug]` - College detail pages
- `/courses/[slug]` - Course detail pages
- `/colleges/[category]/[subcategory]` - Category filtering
- `/student/dashboard` - Student dashboard (Saved, Quiz History, Recommendations)
- `/compare` - College comparison tool
- `/scholarships` - Scholarships listing page
- `/scholarships/[slug]` - Scholarship detail page
- `/fee-calculator` - Fee calculator tool

### Authentication Pattern
- NextAuth.js v5 with Drizzle adapter
- Email/password authentication
- OAuth support (extensible)
- Session management
- Protected routes via middleware
- SessionProvider wrapper for client-side session access
- Role-based access control (admin/student)
- Default user role: "student"

### Lead Capture Pattern
- Multiple capture points (quiz, chat, forms)
- Validation and sanitization
- Status tracking (new → contacted → qualified → converted)
- Link to quiz responses for context

