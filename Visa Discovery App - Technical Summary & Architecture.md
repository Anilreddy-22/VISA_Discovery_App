# Visa Discovery App - Technical Summary & Architecture

## Project Overview

**Application Name:** Visa Agentforce Discovery Workshop App  
**Purpose:** Interactive workshop tool for discovering pain points, generating use cases, calculating ROI, and prioritizing implementation backlog  
**Deployment:** DigitalOcean App Platform  
**URL:** https://visa-discovery-app-yfrz8.ondigitalocean.app

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 7.x
- **Styling:** TailwindCSS 4.x
- **Routing:** React Router (client-side SPA)
- **State Management:** React Context API
- **UI Components:** Custom components with Radix UI primitives

### Backend
- **Runtime:** Node.js 22.x
- **Framework:** Express 4.x
- **Language:** TypeScript with ES Modules
- **Database:** PostgreSQL (TiDB Cloud)
- **ORM:** Drizzle ORM
- **Authentication:** Custom token-based auth

### Infrastructure
- **Hosting:** DigitalOcean App Platform
- **Database:** TiDB Cloud (PostgreSQL-compatible)
- **Build Process:** Automated via DigitalOcean CI/CD
- **Port:** 8080 (DigitalOcean default)
- **Host Binding:** 0.0.0.0 (required for DO App Platform)

---

## Application Architecture

### Directory Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   ├── pages/             # Main application pages
│   │   │   └── Home.tsx       # Primary workshop interface
│   │   ├── lib/               # Utilities and API client
│   │   └── types/             # TypeScript type definitions
│   └── vite.config.ts         # Vite build configuration
│
├── server/                    # Backend Express application
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── sessions.ts    # Workshop session management
│   │   │   ├── painPoints.ts  # Pain point CRUD
│   │   │   ├── useCases.ts    # Use case CRUD
│   │   │   ├── export.ts      # Data export functionality
│   │   │   └── dbViewer.ts    # Database inspection
│   │   ├── db/
│   │   │   ├── index.ts       # Database connection
│   │   │   └── schema.ts      # Drizzle schema definitions
│   │   └── index.ts           # Express server entry point
│   ├── drizzle/               # Database migrations
│   └── .env                   # Environment variables (not in git)
│
├── dist/                      # Build output (generated)
│   └── public/                # Compiled frontend assets
│
├── create-tables-script.js    # Manual table creation script
├── package.json               # Root package configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Database Schema

### Tables

#### 1. `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `sessions`
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `pain_points`
```sql
CREATE TABLE pain_points (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  question TEXT NOT NULL,
  category VARCHAR(100),
  priority INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `use_cases`
```sql
CREATE TABLE use_cases (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  pain_point_id INTEGER REFERENCES pain_points(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  revenue DECIMAL(15,2),
  savings DECIMAL(15,2),
  timeline VARCHAR(50),
  priority INTEGER,
  backlog_priority INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `auth_tokens`
```sql
CREATE TABLE auth_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions` - List all sessions for user
- `POST /api/sessions` - Create new workshop session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Pain Points
- `GET /api/pain-points/:sessionId` - Get pain points for session
- `POST /api/pain-points` - Create pain point
- `PUT /api/pain-points/:id` - Update pain point
- `DELETE /api/pain-points/:id` - Delete pain point

### Use Cases
- `GET /api/use-cases/:sessionId` - Get use cases for session
- `POST /api/use-cases/batch` - Batch create/update use cases
- `PUT /api/use-cases/:id` - Update use case
- `DELETE /api/use-cases/:id` - Delete use case

### Export
- `GET /api/export/:sessionId` - Export session data as JSON

---

## Critical Safari Compatibility Fixes

### Issue
Safari was showing "Failed to load resource: The network connection was lost" for JS/CSS assets, while Chrome worked fine.

### Root Causes Identified
1. **Aggressive browser caching** - Safari cached old HTML referencing non-existent assets
2. **Missing CORS headers** - Safari requires explicit CORS headers for static assets
3. **Load balancer timeouts** - DigitalOcean LB closes connections before server
4. **Relative asset paths** - Safari had issues resolving relative paths in SPA

### Solutions Implemented

#### 1. Vite Configuration (`client/vite.config.ts`)
```typescript
export default defineConfig({
  base: '/',  // Force absolute paths for all assets
  build: {
    rollupOptions: {
      output: {
        // Add timestamp to force new filenames every build
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  }
});
```

**Why this works:**
- `base: '/'` ensures all asset paths are absolute
- `Date.now()` creates unique filenames every deployment, forcing cache invalidation

#### 2. Server Configuration (`server/src/index.ts`)

**A. CORS Headers for Static Assets**
```typescript
app.use('/assets', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(publicPath, 'assets'), {
  maxAge: '1y',
  immutable: true
}));
```

**Why this works:**
- Safari requires explicit CORS headers for cross-origin asset requests
- `Cross-Origin-Resource-Policy: cross-origin` is Safari-specific

**B. Load Balancer Timeout Fix**
```typescript
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});

// Prevent LB from closing connections before server
server.keepAliveTimeout = 61000; // 61 seconds (> LB timeout of 60s)
server.headersTimeout = 65000;   // 65 seconds (> keepAliveTimeout)
```

**Why this works:**
- DigitalOcean LB has 60s timeout
- Server must keep connections alive longer than LB
- Safari is more sensitive to connection drops than Chrome

**C. Compression Middleware**
```typescript
import compression from 'compression';
app.use(compression());
```

**Why this works:**
- Reduces asset transfer time
- Helps prevent Safari timeout issues on slow connections

#### 3. Host Binding for DigitalOcean
```typescript
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);
const server = app.listen(PORT, HOST, () => { ... });
```

**Why this is required:**
- DigitalOcean App Platform requires binding to `0.0.0.0`
- Default port is `8080` (not `3001`)
- Binding to `localhost` will cause deployment to fail

---

## Build & Deployment Process

### Build Command
```bash
cd client && npm install && npm run build && cd ../server && npm install && npm run build
```

**Steps:**
1. Install frontend dependencies
2. Build frontend with Vite → outputs to `dist/public/`
3. Install backend dependencies
4. Build backend with esbuild → outputs to `dist/`

### Run Command
```bash
node dist/index.js
```

### Environment Variables Required

**Server (.env file):**
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
```

**DigitalOcean App Platform:**
- Set `DATABASE_URL` in App Platform environment variables
- Set `NODE_ENV=production`
- Port and Host are auto-configured

---

## Database Setup

### Initial Setup (One-time)

1. **Create tables manually** (migrations don't run on startup):
```bash
npm run create-tables
```

This runs `create-tables-script.js` which creates all tables.

2. **Or use DigitalOcean Console:**
```bash
# In App Platform Console
npm run create-tables
```

### Why Manual Table Creation?

- Drizzle migrations were causing startup failures
- Tables only need to be created once
- Removed migration logic from `server/src/index.ts` for cleaner startup

---

## Known Issues & Limitations

### 1. Safari Caching
**Issue:** Users who visited before the Safari fix may still have cached old files  
**Solution:** Users must clear Safari cache or use Private Browsing mode once

### 2. Duplicate Saves (Fixed)
**Issue:** Save button was creating duplicate database entries  
**Solution:** Fixed in `client/src/pages/Home.tsx` by using `Promise.all()` for parallel saves and proper duplicate detection

### 3. Database Migrations
**Issue:** Drizzle migrations fail on DigitalOcean startup  
**Solution:** Removed migrations, use manual table creation script

### 4. No Data Persistence Between Deployments
**Issue:** Database is external (TiDB Cloud), but sessions/data persist  
**Note:** This is expected behavior - data is NOT lost on deployment

---

## Performance Optimizations

1. **Compression:** Gzip compression enabled for all responses
2. **Asset Caching:** Static assets cached for 1 year (with immutable flag)
3. **Parallel Saves:** Use cases and pain points saved in parallel
4. **Connection Pooling:** PostgreSQL connection pool managed by Drizzle

---

## Security Considerations

1. **Authentication:** Token-based auth with expiring tokens
2. **CORS:** Configured for specific origins (currently permissive for development)
3. **Security Headers:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
4. **Environment Variables:** Sensitive data in `.env` (not committed)
5. **Password Hashing:** Passwords hashed before storage

---

## Future Improvements

### High Priority
1. **Safari Cache Invalidation:** Add service worker for better cache control
2. **Error Handling:** Improve error messages and user feedback
3. **Loading States:** Add loading indicators for save operations
4. **Data Validation:** Add input validation on both client and server

### Medium Priority
1. **Export Formats:** Add PDF/Excel export options
2. **Collaboration:** Multi-user session support
3. **Undo/Redo:** Add undo/redo functionality
4. **Auto-save:** Implement auto-save with debouncing

### Low Priority
1. **Dark Mode:** Add dark mode support
2. **Offline Mode:** Add offline support with service workers
3. **Analytics:** Add usage analytics
4. **Email Notifications:** Send session summaries via email

---

## Development Workflow

### Local Development

1. **Start Database:** Ensure TiDB Cloud connection is available
2. **Start Backend:**
```bash
cd server
npm install
npm run dev
```

3. **Start Frontend:**
```bash
cd client
npm install
npm run dev
```

4. **Access:** http://localhost:5173

### Deployment

1. **Commit changes** to main branch
2. **Push to GitHub**
3. **DigitalOcean auto-deploys** from main branch
4. **Monitor build logs** in DigitalOcean dashboard
5. **Check deployment** at production URL

---

## Troubleshooting

### Safari Shows Blank Page
**Symptoms:** Safari shows blank page, Chrome works  
**Check:**
1. Open Safari Console (Develop → Show JavaScript Console)
2. Look for "Failed to load resource" errors
3. Verify CORS headers are present in Network tab
4. Clear Safari cache completely
5. Try Private Browsing mode

**Solution:** Ensure latest deployment with Safari fixes is live

### Build Fails on DigitalOcean
**Symptoms:** Deployment fails during build  
**Check:**
1. Review build logs in DigitalOcean dashboard
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors
4. Ensure `compression` package is installed

**Solution:** Fix errors and redeploy

### Database Connection Fails
**Symptoms:** "Error: connect ECONNREFUSED"  
**Check:**
1. Verify `DATABASE_URL` in environment variables
2. Check TiDB Cloud connection string
3. Verify database is running
4. Check firewall/IP whitelist settings

**Solution:** Update connection string or whitelist DigitalOcean IPs

### Server Won't Start
**Symptoms:** "Port already in use" or server crashes  
**Check:**
1. Verify port binding is `0.0.0.0:8080`
2. Check for syntax errors in `server/src/index.ts`
3. Verify all imports are correct
4. Check runtime logs in DigitalOcean

**Solution:** Fix errors and redeploy

---

## Contact & Support

**Repository:** (Add GitHub URL here)  
**Deployment:** DigitalOcean App Platform  
**Database:** TiDB Cloud  

For questions or issues, contact the development team.

---

## Appendix: Key Files Reference

### `client/vite.config.ts`
Critical for Safari compatibility - contains `base: '/'` and `Date.now()` cache busting

### `server/src/index.ts`
Main server entry point - contains CORS headers, LB timeout fixes, and host binding

### `client/src/pages/Home.tsx`
Main application logic - workshop flow, save functionality, ROI calculations

### `create-tables-script.js`
Manual database table creation - run once on initial setup

### `package.json`
Root dependencies - ensure `compression` is included

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2024  
**Author:** Manus AI Assistant
