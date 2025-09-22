import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { findPublicByUserId, searchUsers } from '../services/users.service.js';

const router = Router();

// Get a public profile by userId (handle)
router.get('/:userId', async (req, res) => {
  const u = await findPublicByUserId(req.params.userId);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({ user: u });
});

// Search users by name or userId (requires auth to avoid scraping); simple pagination
const searchSchema = z.object({
  query: z.object({ q: z.string().min(1), take: z.string().optional(), skip: z.string().optional() })
});
router.get('/', requireAuth, validate(searchSchema), async (req, res) => {
  const q = String(req.query.q);
  const take = req.query.take ? Number(req.query.take) : 20;
  const skip = req.query.skip ? Number(req.query.skip) : 0;
  const result = await searchUsers(q, { take, skip });
  res.json(result);
});

export default router;
