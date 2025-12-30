import { Router } from 'express';
import { db, schema } from '../db';
import { authenticate } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all pain points for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    const painPoints = await db.select({
      id: schema.painPoints.id,
      sessionId: schema.painPoints.sessionId,
      category: schema.painPoints.category,
      title: schema.painPoints.title,
      description: schema.painPoints.description,
      theme: schema.painPoints.theme,
      priority: schema.painPoints.priority,
      quadrant: schema.painPoints.quadrant,
      createdBy: schema.painPoints.createdBy,
      createdAt: schema.painPoints.createdAt,
      creatorName: schema.users.name,
      creatorEmail: schema.users.email,
    })
      .from(schema.painPoints)
      .leftJoin(schema.users, eq(schema.painPoints.createdBy, schema.users.id))
      .where(eq(schema.painPoints.sessionId, sessionId));

    res.json(painPoints);
  } catch (error) {
    console.error('Get pain points error:', error);
    res.status(500).json({ error: 'Failed to fetch pain points' });
  }
});

// Create new pain point
router.post('/', async (req, res) => {
  console.log('\n🔵 POST /api/pain-points - Request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user);
  
  try {
    const { sessionId, category, title, description, theme, priority, quadrant } = req.body;

    if (!sessionId || !category || !title || !description) {
      console.log('❌ Validation failed - missing required fields');
      console.log('sessionId:', sessionId, 'category:', category, 'title:', title, 'description:', description);
      return res.status(400).json({ 
        error: 'sessionId, category, title, and description are required' 
      });
    }
    console.log('✅ Validation passed');

    // Verify session exists
    const [session] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      console.log('❌ Session not found:', sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }
    console.log('✅ Session found:', session.id);

    console.log('💾 Inserting pain point into database...');
    const [painPoint] = await db.insert(schema.painPoints).values({
      sessionId,
      category,
      title,
      description,
      theme,
      priority,
      quadrant,
      createdBy: req.user!.userId,
    }).returning();
    console.log('✅ Pain point inserted:', painPoint);

    // Update session timestamp
    await db.update(schema.sessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.sessions.id, sessionId));

    console.log('✅ Sending response:', painPoint);
    res.json(painPoint);
  } catch (error) {
    console.error('❌ Create pain point error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to create pain point' });
  }
});

// Update pain point
router.put('/:id', async (req, res) => {
  try {
    const painPointId = parseInt(req.params.id);
    const { category, title, description, theme, priority, quadrant } = req.body;

    // Check if pain point exists
    const [existingPainPoint] = await db.select()
      .from(schema.painPoints)
      .where(eq(schema.painPoints.id, painPointId))
      .limit(1);

    if (!existingPainPoint) {
      return res.status(404).json({ error: 'Pain point not found' });
    }

    // Only creator or admin can update
    if (existingPainPoint.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own pain points' });
    }

    const [updated] = await db.update(schema.painPoints)
      .set({
        category: category !== undefined ? category : existingPainPoint.category,
        title: title !== undefined ? title : existingPainPoint.title,
        description: description !== undefined ? description : existingPainPoint.description,
        theme: theme !== undefined ? theme : existingPainPoint.theme,
        priority: priority !== undefined ? priority : existingPainPoint.priority,
        quadrant: quadrant !== undefined ? quadrant : existingPainPoint.quadrant,
      })
      .where(eq(schema.painPoints.id, painPointId))
      .returning();

    // Update session timestamp
    await db.update(schema.sessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.sessions.id, existingPainPoint.sessionId));

    res.json(updated);
  } catch (error) {
    console.error('Update pain point error:', error);
    res.status(500).json({ error: 'Failed to update pain point' });
  }
});

// Delete pain point
router.delete('/:id', async (req, res) => {
  try {
    const painPointId = parseInt(req.params.id);

    // Check if pain point exists
    const [existingPainPoint] = await db.select()
      .from(schema.painPoints)
      .where(eq(schema.painPoints.id, painPointId))
      .limit(1);

    if (!existingPainPoint) {
      return res.status(404).json({ error: 'Pain point not found' });
    }

    // Only creator or admin can delete
    if (existingPainPoint.createdBy !== req.user!.userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own pain points' });
    }

    await db.delete(schema.painPoints)
      .where(eq(schema.painPoints.id, painPointId));

    // Update session timestamp
    await db.update(schema.sessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.sessions.id, existingPainPoint.sessionId));

    res.json({ message: 'Pain point deleted successfully' });
  } catch (error) {
    console.error('Delete pain point error:', error);
    res.status(500).json({ error: 'Failed to delete pain point' });
  }
});

export default router;
