import { prisma } from '../prisma.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { signAccess, signRefresh } from '../utils/jwt.js';
import crypto from 'crypto';

export async function createUser(input: { name: string; email: string; password: string; userId: string }) {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, userId: input.userId, passwordHash },
    select: { id: true, userId: true, name: true, email: true, createdAt: true },
  });
  return user;
}

export async function loginWithUserId(userId: string, password: string) {
  const u = await prisma.user.findUnique({ where: { userId } });
  if (!u) return null;
  const ok = await comparePassword(password, u.passwordHash);
  if (!ok) return null;
  const payload = { sub: u.id, uid: u.userId, isAdmin: u.isAdmin };
  const accessToken = signAccess(payload);
  const refresh = signRefresh(payload);
  // persist a hashed refresh token for revoke
  const tokenHash = crypto.createHash('sha256').update(refresh).digest('hex');
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId: u.id, tokenHash, expiresAt: exp } });
  return { accessToken, refreshToken: refresh, user: { id: u.id, userId: u.userId, name: u.name } };
}

export async function refreshTokens(userId: string, refreshToken: string) {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const record = await prisma.refreshToken.findFirst({ where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!record) return null;
  const u = record.user;
  const payload = { sub: u.id, uid: u.userId, isAdmin: u.isAdmin };
  const accessToken = signAccess(payload);
  const newRefresh = signRefresh(payload);
  const newHash = crypto.createHash('sha256').update(newRefresh).digest('hex');
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({ data: { userId: u.id, tokenHash: newHash, expiresAt: exp } }),
  ]);
  return { accessToken, refreshToken: newRefresh };
}

export async function getProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, userId: true, name: true, email: true, bio: true, interests: true, avatarUrl: true, createdAt: true } });
}

export async function updateProfile(userId: string, data: { name?: string; bio?: string; avatarUrl?: string; interests?: string[] }) {
  return prisma.user.update({ where: { id: userId }, data, select: { id: true, userId: true, name: true, email: true, bio: true, interests: true, avatarUrl: true, createdAt: true } });
}

export async function revokeRefreshTokens(userId: string, refreshToken?: string) {
  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.updateMany({ where: { userId, tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  } else {
    await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) return false;
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
  return true;
}
