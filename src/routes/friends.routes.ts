import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json({
    suggested: [
      { id: 'u_alice', name: 'Alice', meta: 'CS · Year 2' },
      { id: 'u_brian', name: 'Brian', meta: 'Math · Year 1' },
      { id: 'u_chloe', name: 'Chloe', meta: 'Design · Year 3' },
    ],
    buddies: [
      { id: 'u_dinesh', name: 'Dinesh' },
      { id: 'u_esha', name: 'Esha' },
    ],
    added: [
      { id: 'u_megan', name: 'Megan' },
      { id: 'u_lee', name: 'Lee' },
    ],
  });
});

export default router;
