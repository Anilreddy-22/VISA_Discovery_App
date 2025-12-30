import { Router } from 'express';
import { db, schema } from '../db';
import { authenticate } from '../middleware/auth';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await db.select({
      id: schema.sessions.id,
      name: schema.sessions.name,
      description: schema.sessions.description,
      createdBy: schema.sessions.createdBy,
      createdAt: schema.sessions.createdAt,
      updatedAt: schema.sessions.updatedAt,
      creatorName: schema.users.name,
      creatorEmail: schema.users.email,
    })
      .from(schema.sessions)
      .leftJoin(schema.users, eq(schema.sessions.createdBy, schema.users.id))
      .orderBy(desc(schema.sessions.updatedAt));

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get single session
router.get('/:id', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    const [session] = await db.select({
      id: schema.sessions.id,
      name: schema.sessions.name,
      description: schema.sessions.description,
      createdBy: schema.sessions.createdBy,
      createdAt: schema.sessions.createdAt,
      updatedAt: schema.sessions.updatedAt,
      creatorName: schema.users.name,
      creatorEmail: schema.users.email,
    })
      .from(schema.sessions)
      .leftJoin(schema.users, eq(schema.sessions.createdBy, schema.users.id))
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Create new session
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    const [session] = await db.insert(schema.sessions).values({
      name,
      description: description || '',
      createdBy: req.user!.userId,
    }).returning();

    res.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/:id', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { name, description } = req.body;

    // Check if session exists and user has permission
    const [existingSession] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only creator or admin can update
    if (existingSession.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const [updated] = await db.update(schema.sessions)
      .set({
        name: name || existingSession.name,
        description: description !== undefined ? description : existingSession.description,
        updatedAt: new Date(),
      })
      .where(eq(schema.sessions.id, sessionId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);

    // Check if session exists and user has permission
    const [existingSession] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only creator or admin can delete
    if (existingSession.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await db.delete(schema.sessions)
      .where(eq(schema.sessions.id, sessionId));

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
