import { Router } from 'express';
import { db, schema } from '../db';

const router = Router();

// Get all data for viewing
router.get('/all', async (req, res) => {
  try {
    const users = await db.select().from(schema.users);
    const sessions = await db.select().from(schema.sessions);
    const painPoints = await db.select().from(schema.painPoints);
    const useCases = await db.select().from(schema.useCases);

    res.json({
      users: users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })),
      sessions,
      painPoints,
      useCases,
      stats: {
        totalUsers: users.length,
        totalSessions: sessions.length,
        totalPainPoints: painPoints.length,
        totalUseCases: useCases.length
      }
    });
  } catch (error) {
    console.error('Database viewer error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

export default router;
