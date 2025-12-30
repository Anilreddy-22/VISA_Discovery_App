import { Router } from 'express';
import { db, schema } from '../db';
import { authenticate } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all use cases for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);

    const useCases = await db.select({
      id: schema.useCases.id,
      sessionId: schema.useCases.sessionId,
      useCaseId: schema.useCases.useCaseId,
      priority: schema.useCases.priority,
      quadrant: schema.useCases.quadrant,
      revenue: schema.useCases.revenue,
      savings: schema.useCases.savings,
      timeline: schema.useCases.timeline,

      // anil  ADD THESE 6 LINES:
      name: schema.useCases.name,
      category: schema.useCases.category,
      problem: schema.useCases.problem,
      agentRole: schema.useCases.agentRole,
      dataRequired: schema.useCases.dataRequired,
      integration: schema.useCases.integration,
      // END

      updatedBy: schema.useCases.updatedBy,
      updatedAt: schema.useCases.updatedAt,
      updaterName: schema.users.name,
    })
      .from(schema.useCases)
      .leftJoin(schema.users, eq(schema.useCases.updatedBy, schema.users.id))
      .where(eq(schema.useCases.sessionId, sessionId));

    res.json(useCases);
  } catch (error) {
    console.error('Get use cases error:', error);
    res.status(500).json({ error: 'Failed to fetch use cases' });
  }
});

// Update or create use case state
router.post('/', async (req, res) => {
  try {
    const { sessionId, useCaseId, priority, quadrant, revenue, savings, timeline, name, category, problem, agentRole, dataRequired, integration } = req.body;

    if (!sessionId || !useCaseId) {
      return res.status(400).json({ error: 'sessionId and useCaseId are required' });
    }

    // Verify session exists
    const [session] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if use case already exists for this session
    const [existing] = await db.select()
      .from(schema.useCases)
      .where(
        and(
          eq(schema.useCases.sessionId, sessionId),
          eq(schema.useCases.useCaseId, useCaseId)
        )
      )
      .limit(1);

    let result;

    if (existing) {
      // Update existing
      [result] = await db.update(schema.useCases)
        .set({
          priority: priority !== undefined ? priority : existing.priority,
          quadrant: quadrant !== undefined ? quadrant : existing.quadrant,
          revenue: revenue !== undefined ? revenue : existing.revenue,
          savings: savings !== undefined ? savings : existing.savings,
          timeline: timeline !== undefined ? timeline : existing.timeline,
          // anil  ADD THESE 6 LINES:
          name: name !== undefined ? name : existing.name,
          category: category !== undefined ? category : existing.category,
          problem: problem !== undefined ? problem : existing.problem,
          agentRole: agentRole !== undefined ? agentRole : existing.agentRole,
          dataRequired: dataRequired !== undefined ? dataRequired : existing.dataRequired,
          integration: integration !== undefined ? integration : existing.integration,
          // END
          updatedBy: req.user!.userId,
          updatedAt: new Date(),
        })
        .where(eq(schema.useCases.id, existing.id))
        .returning();
    } else {
      // Create new
      [result] = await db.insert(schema.useCases).values({
        sessionId,
        useCaseId,
        priority,
        quadrant,
        revenue,
        savings,
        timeline,
        // anil  ADD THESE 6 LINES:
        name,
        category,
        problem,
        agentRole,
        dataRequired,
        integration,
        // END
        updatedBy: req.user!.userId,
      }).returning();
    }

    // Update session timestamp
    await db.update(schema.sessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.sessions.id, sessionId));

    res.json(result);
  } catch (error) {
    console.error('Update use case error:', error);
    res.status(500).json({ error: 'Failed to update use case' });
  }
});

// Batch update use cases (for drag-and-drop operations)
router.post('/batch', async (req, res) => {
  try {
    console.log('📦 Batch update received:', { sessionId: req.body.sessionId, updateCount: req.body.updates?.length });
    const { sessionId, updates } = req.body;

    if (!sessionId || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'sessionId and updates array are required' });
    }

    // Verify session exists
    const [session] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const results = [];

    for (const update of updates) {
      const { useCaseId, priority, quadrant, revenue, savings, timeline, name, category, problem, agentRole, dataRequired, integration } = update;

      if (!useCaseId) continue;

      // Check if exists
      const [existing] = await db.select()
        .from(schema.useCases)
        .where(
          and(
            eq(schema.useCases.sessionId, sessionId),
            eq(schema.useCases.useCaseId, useCaseId)
          )
        )
        .limit(1);

      let result;

      if (existing) {
        [result] = await db.update(schema.useCases)
          .set({
            priority: priority !== undefined ? priority : existing.priority,
            quadrant: quadrant !== undefined ? quadrant : existing.quadrant,
            revenue: revenue !== undefined ? revenue : existing.revenue,
            savings: savings !== undefined ? savings : existing.savings,
            timeline: timeline !== undefined ? timeline : existing.timeline,

            // anil ADD THESE 6 LINES:
            name: name !== undefined ? name : existing.name,
            category: category !== undefined ? category : existing.category,
            problem: problem !== undefined ? problem : existing.problem,
            agentRole: agentRole !== undefined ? agentRole : existing.agentRole,
            dataRequired: dataRequired !== undefined ? dataRequired : existing.dataRequired,
            integration: integration !== undefined ? integration : existing.integration,
            // END


            updatedBy: req.user!.userId,
            updatedAt: new Date(),
          })
          .where(eq(schema.useCases.id, existing.id))
          .returning();
      } else {
        [result] = await db.insert(schema.useCases).values({
          sessionId,
          useCaseId,
          priority,
          quadrant,
          revenue,
          savings,
          timeline,
          // anil ADD THESE 6 LINES:
          name,
          category,
          problem,
          agentRole,
          dataRequired,
          integration,
          // END

          updatedBy: req.user!.userId,
        }).returning();
      }

      results.push(result);
    }

    // Update session timestamp
    await db.update(schema.sessions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.sessions.id, sessionId));

    res.json(results);
  } catch (error) {
    console.error('Batch update error:', error);
    res.status(500).json({ error: 'Failed to batch update use cases' });
  }
});

export default router;
