import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { changePassword, createUser, getProfile, loginWithUserId, refreshTokens, revokeRefreshTokens, updateProfile } from '../services/auth.service.js';
const router = Router();
const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        userId: z.string().min(4).max(20).regex(/^[a-z0-9_\-]+$/i),
    }),
});
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        console.log('POST /api/auth/register', { userId: req.body?.userId, email: req.body?.email });
        const { name, email, password, userId } = req.body;
        const user = await createUser({ name, email, password, userId });
        res.status(201).json({ success: true, user });
    }
    catch (e) {
        console.error('Register error', e?.message || e);
        if (e?.code === 'P2002') {
            // Unique constraint violation (Prisma P2002) -> 409 Conflict
            return res.status(409).json({ success: false, message: 'UserId or email already exists' });
        }
        return res.status(500).json({ success: false, message: e?.message || 'Registration failed' });
    }
});
const loginSchema = z.object({ body: z.object({ userId: z.string(), password: z.string() }) });
router.post('/login', validate(loginSchema), async (req, res) => {
    const { userId, password } = req.body;
    const result = await loginWithUserId(userId, password);
    if (!result)
        return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
});
const refreshSchema = z.object({ body: z.object({ userId: z.string(), refreshToken: z.string() }) });
router.post('/refresh', validate(refreshSchema), async (req, res) => {
    const { userId, refreshToken } = req.body;
    const result = await refreshTokens(userId, refreshToken);
    if (!result)
        return res.status(401).json({ error: 'Invalid refresh token' });
    res.json(result);
});
router.get('/me', requireAuth, async (req, res) => {
    const profile = await getProfile(req.user.id);
    res.json({ user: profile });
});
const updateSchema = z.object({ body: z.object({ name: z.string().optional(), bio: z.string().max(400).optional(), avatarUrl: z.string().url().optional(), interests: z.array(z.string()).optional() }) });
router.put('/me', requireAuth, validate(updateSchema), async (req, res) => {
    const updated = await updateProfile(req.user.id, req.body);
    res.json({ user: updated });
});
// Logout: revoke a specific refresh token (if provided) or all of the user's tokens
const logoutSchema = z.object({ body: z.object({ refreshToken: z.string().optional() }) });
router.post('/logout', requireAuth, validate(logoutSchema), async (req, res) => {
    const token = req.body?.refreshToken;
    await revokeRefreshTokens(req.user.id, token);
    res.json({ ok: true });
});
// Change password: verify current password, set new one, revoke all refresh tokens
const changePasswordSchema = z.object({
    body: z.object({ currentPassword: z.string().min(8), newPassword: z.string().min(8) }),
});
router.post('/change-password', requireAuth, validate(changePasswordSchema), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const ok = await changePassword(req.user.id, currentPassword, newPassword);
    if (!ok)
        return res.status(400).json({ error: 'Current password is incorrect' });
    res.json({ ok: true });
});
export default router;
