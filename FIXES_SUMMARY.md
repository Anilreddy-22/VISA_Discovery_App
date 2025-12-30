# Bug Fixes Summary - Local Setup & Data Persistence Issues

## Date: December 17, 2025
## Branch: `issues-fix-enhanced`

---

## Issues Fixed

### 1. **Database Migration Failure - SQLite vs PostgreSQL Syntax Mismatch**

**Problem:**
- Migration files were generated with SQLite syntax (backticks, `AUTOINCREMENT`, `unixepoch()`)
- Local PostgreSQL database rejected the migrations with syntax errors
- Error: `syntax error at or near "\`"`

**Root Cause:**
- Migration files in `server/drizzle/` were created for SQLite dialect
- `drizzle.config.ts` correctly specified PostgreSQL, but existing migrations had wrong syntax

**Solution:**
- Deleted old SQLite migration files from `server/drizzle/`
- Regenerated migrations using `drizzle-kit generate` with correct PostgreSQL syntax
- New migrations use proper PostgreSQL types: `serial`, `timestamp DEFAULT now()`, double quotes

**Files Changed:**
- `server/drizzle/0000_white_gladiator.sql` (regenerated)

---

### 2. **Environment Variables Not Loading - DATABASE_URL Undefined**

**Problem:**
- Server crashed on startup with `DATABASE_URL environment variable is required`
- Environment variables in `.env` and `server/.env` were not being loaded
- Error occurred even though `DATABASE_URL` was present in env files

**Root Cause:**
- ES modules load all imports before executing any code
- `dotenv.config()` was called after route imports, which imported `db/index.ts`
- `db/index.ts` tried to access `process.env.DATABASE_URL` before dotenv loaded it

**Solution:**
- Updated `package.json` dev script to use `tsx --env-file=server/.env` flag
- This loads environment variables before any code executes
- Also moved `dotenv.config()` to top of `server/src/index.ts` before other imports

**Files Changed:**
- `package.json` - Updated `dev:server` script
- `server/src/index.ts` - Reordered imports

---

### 3. **API Calls with NaN Session ID**

**Problem:**
- API requests failing with URLs like `/api/pain-points/session/NaN`
- `sessionId` was `NaN` when making API calls

**Root Cause:**
- `localStorage.getItem('workshop_session_id')` returned invalid/corrupted values
- `parseInt()` on invalid strings returns `NaN`
- No validation before making API calls with the parsed ID

**Solution:**
- Added validation in `WorkshopContext.tsx` to check if parsed session ID is valid number
- Clear invalid session IDs from localStorage automatically
- Create new session if stored ID is invalid
- Added comprehensive logging for debugging session initialization

**Files Changed:**
- `client/src/contexts/WorkshopContext.tsx` - Added `isNaN()` checks and localStorage cleanup

---

### 4. **PUT Requests to /api/pain-points/NaN**

**Problem:**
- Update requests failing with `PUT /api/pain-points/NaN`
- Initial pain points (like `pp5`, `time-1`) couldn't be updated in database

**Root Cause:**
- `updateCustomPainPoint()` only handled pain points with `custom-` prefix
- Initial pain points have IDs like `pp5`, `time-1`, `accuracy-2` (no `custom-` prefix)
- When trying to extract numeric ID from these, `parseInt()` returned `NaN`

**Solution:**
- Enhanced `updateCustomPainPoint()` to handle both custom and initial pain points
- For custom pain points: Extract ID from `custom-{id}` prefix
- For initial pain points: Look up database record by matching `question` field, then extract ID
- Added validation to prevent `NaN` from reaching the API

**Files Changed:**
- `client/src/contexts/WorkshopContext.tsx` - Enhanced update logic with question-based lookup

---

### 5. **Vite Dev Server Configuration Issues**

**Problem:**
- Running `npm run dev` from client directory resulted in 404 errors
- Vite couldn't find `index.html` file

**Root Cause:**
- Vite config had `root: __dirname` which caused path resolution issues
- `npm run dev` script ran from root directory but looked for files in wrong location

**Solution:**
- Removed problematic `root: __dirname` from `vite.config.ts`
- Updated root `package.json` dev script to `cd client && vite --host`
- Added proper ES module `__dirname` definition using `fileURLToPath`
- Added Vite proxy configuration to forward `/api` requests to backend on port 3003

**Files Changed:**
- `client/vite.config.ts` - Fixed root path and added proxy config
- `package.json` - Updated dev script to run from client directory

---

## Testing Performed

1. ✅ Database migrations run successfully on local PostgreSQL
2. ✅ Server starts without environment variable errors
3. ✅ Session initialization works with valid/invalid localStorage values
4. ✅ Pain points (both initial and custom) save and update correctly
5. ✅ No more NaN in API requests
6. ✅ Vite dev server runs correctly with hot reload
7. ✅ API proxy works between frontend (5173/5174) and backend (3003)

---

## Development Setup Now Working

**Backend:**
```bash
npm run dev:server
# Runs on http://localhost:3003
```

**Frontend:**
```bash
npm run dev
# Runs on http://localhost:5173 (or 5174)
# Proxies /api requests to backend
```

**Both Together:**
```bash
npm run dev:all
# Runs both frontend and backend concurrently
```

---

## Key Learnings

1. **ES Modules & Environment Variables**: Must load env vars before any imports that use them
2. **Database Dialect Matters**: Migration files are dialect-specific, can't mix SQLite and PostgreSQL
3. **Data Validation**: Always validate parsed integers before using in API calls
4. **Pain Point IDs**: System uses two ID formats - initial (`pp5`) and custom (`custom-123`)
5. **Vite Configuration**: Root path and proxy settings critical for dev server functionality

---

## Related Documentation

- See `Visa Discovery App - Technical Summary & Architecture.md` for full system architecture
- Database schema defined in `server/src/db/schema.ts`
- Pain point data flow: `Home.tsx` → `WorkshopContext.tsx` → `api.ts` → Backend routes
