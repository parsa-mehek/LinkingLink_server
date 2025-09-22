import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { addProgressEntry, listProgressEntries } from '../services/progress.service.js';
const router = Router();
const createSchema = z.object({
    body: z.object({
        subject: z.string().min(1),
        minutesStudied: z.number().int().positive(),
        notes: z.string().max(2000).optional(),
        date: z.string().datetime().optional(),
    })
});
router.post('/', requireAuth, validate(createSchema), async (req, res) => {
    const { subject, minutesStudied, notes, date } = req.body;
    const entry = await addProgressEntry(req.user.id, { subject, minutesStudied, notes, date: date ? new Date(date) : undefined });
    res.status(201).json({ entry });
});
const listSchema = z.object({
    query: z.object({ subject: z.string().optional() })
});
router.get('/', requireAuth, validate(listSchema), async (req, res) => {
    const subject = req.query.subject || undefined;
    const items = await listProgressEntries(req.user.id, { subject });
    res.json({ items });
});
export default router;
