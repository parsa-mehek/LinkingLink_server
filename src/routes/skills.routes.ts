import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json({
    trending: ['Python', 'Figma', 'Data Viz', 'Excel', 'Public Speaking'],
    updatedAt: new Date().toISOString(),
  });
});

export default router;
