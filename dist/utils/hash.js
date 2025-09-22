import bcrypt from 'bcryptjs';
const ROUNDS = 10;
export async function hashPassword(pw) {
    return bcrypt.hash(pw, ROUNDS);
}
export async function comparePassword(pw, hash) {
    return bcrypt.compare(pw, hash);
}
