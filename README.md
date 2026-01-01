# SeeMyCampus - Admissions Counseling Platform

A modern, AI-powered platform for college admissions counseling, helping students find their perfect college match.

## Features

- 🎓 **College & Course Discovery**: Browse colleges and courses with detailed information
- 🤖 **AI Chatbot**: Get instant answers to your college-related questions
- 📝 **Smart Quiz**: Take a quiz to get personalized college recommendations
- 📊 **Lead Management**: Track and manage student leads
- 🔍 **SEO Optimized**: Built with SEO best practices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **AI**: Flexible AI provider integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker (for local PostgreSQL)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd seemycampus
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start PostgreSQL with Docker:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
seemycampus/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── db/               # Database schema and connection
│   └── lib/              # Utilities and helpers
├── public/               # Static assets
└── docker-compose.yml    # Local PostgreSQL setup
```

## Database

The project uses PostgreSQL with Drizzle ORM. Database schema is defined in `src/db/schema.ts`.

### Running Migrations

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `AI_PROVIDER`: AI provider type (`ollama`, `openrouter`, `openai`, or `custom`)

### AI Provider Configuration

#### Ollama (Local - Recommended for Privacy)
```env
AI_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434  # Default, change if Ollama runs on different port
OLLAMA_MODEL=llama3.2:latest  # or llama3.1:8b, mistral:latest, qwen2.5:7b, etc.
```

**Setup Ollama:**
1. Install Ollama from [ollama.com](https://ollama.com/download)
2. Pull a model (if needed): `ollama pull llama3.2` or use an existing model
3. Ensure Ollama is running before starting the Next.js server

#### OpenRouter (Cloud)
```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-3.5-turbo  # or any model from OpenRouter
OPENROUTER_REFERER=https://yourdomain.com  # Optional
OPENROUTER_TITLE=SeeMyCampus Chatbot  # Optional
```

#### OpenAI (Cloud)
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
```

#### Custom Provider
```env
AI_PROVIDER=custom
AI_API_KEY=your_api_key
AI_API_URL=your_api_endpoint
AI_MODEL=your_model_name
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

