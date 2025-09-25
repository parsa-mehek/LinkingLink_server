import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

// Dummy feed route returning hardcoded items for dashboard demo
// In a real implementation this would query DB / recommendation engine
const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json({
    items: [
      {
        id: 'f1',
        type: 'achievement',
        user: 'Alice',
        title: "Alice earned 'Note Master'",
        description: 'Uploaded 5 high-quality notes this week',
        likes: 12,
        comments: 3,
        shares: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'f2',
        type: 'study_session',
        title: 'Study Session: Algorithms',
        time: 'Today 6–8 PM',
        group: 'CS Group',
        attendees: 7,
        createdAt: new Date().toISOString(),
      },
    ],
  });
});

export default router;
