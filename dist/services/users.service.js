import { prisma } from '../prisma.js';
export function findPublicByUserId(userId) {
    return prisma.user.findUnique({
        where: { userId },
        select: { id: true, userId: true, name: true, avatarUrl: true, bio: true, interests: true, createdAt: true }
    });
}
export async function searchUsers(q, opts) {
    const [items, total] = await Promise.all([
        prisma.user.findMany({
            where: { OR: [{ userId: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] },
            select: { id: true, userId: true, name: true, avatarUrl: true },
            take: opts.take,
            skip: opts.skip,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: { OR: [{ userId: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }] } }),
    ]);
    return { items, total, take: opts.take, skip: opts.skip };
}
