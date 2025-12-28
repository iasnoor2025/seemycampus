# Technical Context: SeeMyCampus

## Technology Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Tabler Icons

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (App Router)
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Tooling**: Drizzle Kit

### AI & Integrations
- **AI Framework**: Vercel AI SDK (`ai` package v3.0.0)
- **AI Providers**: Flexible provider system supporting:
  - Custom AI providers
  - OpenAI
  - Extensible for other providers (Anthropic, etc.)

### Development Tools
- **Package Manager**: npm
- **Database Management**: Docker Compose (local PostgreSQL)
- **Type Checking**: TypeScript 5.4+
- **Linting**: ESLint with Next.js config

## Development Setup

### Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL)
- npm or yarn

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `AI_API_KEY`: AI provider API key
- `AI_API_URL`: AI provider API URL
- `AI_PROVIDER`: AI provider type (custom, openai, anthropic)
- `OPENAI_API_KEY`: OpenAI API key (if using OpenAI)
- `OPENAI_MODEL`: OpenAI model name
- `AI_MODEL`: Custom AI model name
- `INSTAGRAM_ACCESS_TOKEN`: Instagram Graph API long-lived access token (optional)
- `INSTAGRAM_USER_ID`: Instagram User ID for Graph API (optional)
- `NEXT_PUBLIC_BASE_URL`: Public base URL for SEO and sharing (optional)

### Database
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit migrations
- **Schema Location**: `src/db/schema.ts`
- **Seed Script**: `src/db/seed.ts`

### Key Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:generate`: Generate database migrations
- `npm run db:migrate`: Apply database migrations
- `npm run db:studio`: Open Drizzle Studio
- `npm run db:seed`: Seed database with initial data
- `npm run db:seed:exams`: Seed entrance exams data
- `npm run db:seed:logos`: Seed college logos from web
- `npm run db:seed:hero-texts`: Seed hero rotating texts
- `npm run db:seed:comprehensive`: Seed comprehensive college data

## Project Structure
```
seemycampus/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/        # React components
│   │   ├── chat/         # Chatbot components
│   │   ├── college/      # College display components
│   │   ├── colleges/     # College listing components
│   │   ├── dashboard/    # Admin dashboard components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── quiz/         # Quiz components
│   │   ├── entrance-exams/ # Entrance exam components
│   │   ├── student/       # Student dashboard components
│   │   └── ui/           # shadcn/ui components
│   ├── db/               # Database schema, migrations, seed
│   └── lib/              # Utilities and business logic
│       ├── ai/           # AI chatbot implementation
│       ├── leads/        # Lead capture and validation
│       ├── recommendations/ # Recommendation engine
│       └── seo/          # SEO utilities
├── public/               # Static assets
└── docker-compose.yml    # Local PostgreSQL setup
```

## Technical Constraints
- Next.js App Router architecture (no Pages Router)
- PostgreSQL database requirement
- TypeScript strict mode
- Server-side rendering for SEO

