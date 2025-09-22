import { prisma } from '../prisma.js';

export async function addProgressEntry(userId: string, input: { subject: string; minutesStudied: number; notes?: string; date?: Date }) {
  const entry = await prisma.progressEntry.create({
    data: {
      userId,
      subject: input.subject,
      minutesStudied: input.minutesStudied,
      notes: input.notes,
      date: input.date ?? new Date(),
    },
    select: { id: true, userId: true, subject: true, minutesStudied: true, notes: true, date: true, createdAt: true },
  });
  return entry;
}

export async function listProgressEntries(userId: string, opts?: { subject?: string }) {
  const where: any = { userId };
  if (opts?.subject) where.subject = { contains: opts.subject, mode: 'insensitive' };
  return prisma.progressEntry.findMany({
    where,
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, userId: true, subject: true, minutesStudied: true, notes: true, date: true, createdAt: true },
  });
}
