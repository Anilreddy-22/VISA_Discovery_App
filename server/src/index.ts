import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '../../server/.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import sessionsRoutes from './routes/sessions';
import painPointsRoutes from './routes/painPoints';
import useCasesRoutes from './routes/useCases';
import exportRoutes from './routes/export';
import dbViewerRoutes from './routes/dbViewer';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Safari-compatible CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Safari-compatible security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/pain-points', painPointsRoutes);
app.use('/api/use-cases', useCasesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/db-viewer', dbViewerRoutes);

// Serve static files from public directory
const publicPath = path.resolve(process.cwd(), "dist/public");
app.use(express.static(publicPath, { index: false }));

app.get('/assets/*', (req, res) => {
  res.sendStatus(404);
});

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  if (req.path.includes('.')) {
    return res.sendStatus(404);
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  console.log('🗄️  Connecting to PostgreSQL database...');
  
  // Start server and capture instance
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
  });

  server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the other process using it, or change PORT in server/.env.`);
      process.exit(1);
    }
    throw err;
  });

  // Fix for DigitalOcean/AWS Load Balancer "Connection Lost" issues
  // Safari is more sensitive to connection timeouts than Chrome
  server.keepAliveTimeout = 61000; // 61 seconds (longer than LB timeout of 60s)
  server.headersTimeout = 65000;   // 65 seconds (must be > keepAliveTimeout)
  console.log('✅ Applied Load Balancer Keep-Alive timeouts');
}

startServer();
