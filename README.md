# Visa Discovery App V2

A **client discovery and ROI estimation tool** for cross-border payment solution providers. This POC application helps identify operational pain points and quantifies the ROI of implementing AI agents to automate workflows.

## 🎯 Purpose

Enable sales and RevOps teams to:
- **Discover** client pain points through guided questioning
- **Categorize** issues by theme (Sales, Pricing, RevOps, Customer Support)
- **Prioritize** using quadrant analysis
- **Quantify** ROI with revenue impact, cost savings, and efficiency gains
- **Export** findings for presentations

## 💰 Business Value

**12 pre-configured use cases** with baseline ROI projections:

- **$3.63M** annual revenue impact
- **$1.51M** annual cost savings
- **$5.14M** total ROI
- **202 hours/week** efficiency gains
- **13 AI agents** across multiple domains

### Sample Use Cases

1. **Automated NDA Verification** - $380K revenue impact
2. **Intelligent Service Model Selection** - $280K
3. **Automated Compliance Checks** - $520K
4. **Order Review & Validation** - $180K
5. **Support Ticket Triage** - $95K

## 🏗️ Tech Stack

**Frontend:** React 19, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion

**Backend:** Node.js 22, Express, PostgreSQL, Drizzle ORM, JWT auth

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x
- pnpm 10.x
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

# Set up database
pnpm db:generate
pnpm db:migrate

# Start development
pnpm dev:all
```

### Environment Variables

**Root `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/visa_discovery
```

**`server/.env`:**
```env
PORT=3001
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/visa_discovery
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:3001
```

## 📝 Available Scripts

```bash
pnpm dev              # Start frontend (http://localhost:5173)
pnpm dev:server       # Start backend (http://localhost:3001)
pnpm dev:all          # Start both servers
pnpm build            # Build for production
pnpm start            # Start production server
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

## 🎨 Workflow Steps

8-step discovery process:

1. **Welcome** - Introduction
2. **Identify** - Capture pain points
3. **Categorize** - Assign themes
4. **Prioritize** - Quadrant analysis
5. **Deep-dive** - Use case exploration
6. **ROI** - Calculate financial impact
7. **Backlog** - Prioritize timeline
8. **Next Steps** - Export findings

## 🗄️ Database Schema

- **users** - User accounts with role-based access
- **sessions** - Workshop sessions
- **painPoints** - Custom pain points
- **useCases** - Use case states and ROI
- **authTokens** - JWT session management

## 📊 Features

- ✅ Guided pain point identification
- ✅ Theme categorization with charts
- ✅ Quadrant prioritization matrix
- ✅ ROI calculation (revenue, savings, efficiency)
- ✅ Real-time collaboration
- ✅ PostgreSQL persistence
- ✅ Export functionality
- ✅ Dark/Light theme support
- ✅ Safari compatibility

## 🌐 Production Deployment

```bash
# Build
pnpm build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://...
export JWT_SECRET=...

# Start
pnpm start
```

## 📁 Project Structure

```
Visa-Discovery-App-V2/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── contexts/         # State management
│   │   ├── pages/            # Page components
│   │   └── audrey_use_cases_with_roi.ts  # Use cases data
│   └── vite.config.ts
├── server/                    # Express backend
│   ├── src/
│   │   ├── db/               # Database & migrations
│   │   ├── routes/           # API endpoints
│   │   └── index.ts
│   └── .env
├── dist/                      # Production build
└── package.json
```

## 🔐 Authentication

- User registration with email/password
- JWT-based sessions
- Role-based access (user/admin)
- Protected routes and API endpoints

## 🐛 Troubleshooting

**Port in use:**
```bash
# Change PORT in server/.env
PORT=3002
```

**Database connection:**
```bash
# Verify DATABASE_URL
echo $DATABASE_URL
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
pnpm install
```

## 📄 License

MIT

## 🤝 Contributing

This is a POC application. For production use, consider:
- Enhanced security measures
- Rate limiting
- Comprehensive error handling
- Unit and integration tests
- CI/CD pipeline
- Monitoring and logging
