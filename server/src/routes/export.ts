import { Router } from 'express';
import { db, schema } from '../db';
import { authenticate } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export session data as JSON
router.get('/session/:sessionId/json', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    // Get session
    const [session] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get pain points
    const painPoints = await db.select({
      id: schema.painPoints.id,
      category: schema.painPoints.category,
      title: schema.painPoints.title,
      description: schema.painPoints.description,
      createdBy: schema.painPoints.createdBy,
      createdAt: schema.painPoints.createdAt,
      creatorName: schema.users.name,
      creatorEmail: schema.users.email,
    })
      .from(schema.painPoints)
      .leftJoin(schema.users, eq(schema.painPoints.createdBy, schema.users.id))
      .where(eq(schema.painPoints.sessionId, sessionId));

    // Get use cases
    const useCases = await db.select({
      useCaseId: schema.useCases.useCaseId,
      priority: schema.useCases.priority,
      quadrant: schema.useCases.quadrant,
      revenue: schema.useCases.revenue,
      savings: schema.useCases.savings,
      timeline: schema.useCases.timeline,
      updatedBy: schema.useCases.updatedBy,
      updatedAt: schema.useCases.updatedAt,
      updaterName: schema.users.name,
    })
      .from(schema.useCases)
      .leftJoin(schema.users, eq(schema.useCases.updatedBy, schema.users.id))
      .where(eq(schema.useCases.sessionId, sessionId));

    const exportData = {
      session: {
        id: session.id,
        name: session.name,
        description: session.description,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      painPoints,
      useCases,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}-export.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Export session data as CSV
router.get('/session/:sessionId/csv', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    // Get session
    const [session] = await db.select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get pain points
    const painPoints = await db.select({
      id: schema.painPoints.id,
      category: schema.painPoints.category,
      title: schema.painPoints.title,
      description: schema.painPoints.description,
      creatorName: schema.users.name,
      createdAt: schema.painPoints.createdAt,
    })
      .from(schema.painPoints)
      .leftJoin(schema.users, eq(schema.painPoints.createdBy, schema.users.id))
      .where(eq(schema.painPoints.sessionId, sessionId));

    // Get use cases
    const useCases = await db.select({
      useCaseId: schema.useCases.useCaseId,
      priority: schema.useCases.priority,
      quadrant: schema.useCases.quadrant,
      revenue: schema.useCases.revenue,
      savings: schema.useCases.savings,
      timeline: schema.useCases.timeline,
      updaterName: schema.users.name,
      updatedAt: schema.useCases.updatedAt,
    })
      .from(schema.useCases)
      .leftJoin(schema.users, eq(schema.useCases.updatedBy, schema.users.id))
      .where(eq(schema.useCases.sessionId, sessionId));

    // Build CSV content
    let csv = `Session: ${session.name}\n`;
    csv += `Description: ${session.description || 'N/A'}\n`;
    csv += `Exported: ${new Date().toISOString()}\n\n`;

    // Pain Points section
    csv += 'CUSTOM PAIN POINTS\n';
    csv += 'ID,Category,Title,Description,Created By,Created At\n';
    painPoints.forEach(pp => {
      csv += `${pp.id},"${pp.category}","${pp.title}","${pp.description.replace(/"/g, '""')}","${pp.creatorName}","${pp.createdAt}"\n`;
    });

    csv += '\n';

    // Use Cases section
    csv += 'USE CASE PRIORITIES & ROI\n';
    csv += 'Use Case ID,Priority,Quadrant,Revenue,Savings,Timeline,Updated By,Updated At\n';
    useCases.forEach(uc => {
      csv += `"${uc.useCaseId}","${uc.priority || ''}","${uc.quadrant || ''}",${uc.revenue || ''},${uc.savings || ''},"${uc.timeline || ''}","${uc.updaterName}","${uc.updatedAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="session-${sessionId}-export.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
