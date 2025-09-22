import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, ROUNDS);
}

export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}
