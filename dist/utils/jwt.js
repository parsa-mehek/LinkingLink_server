import jwt from 'jsonwebtoken';
import { env } from '../config.js';
export function signAccess(payload) {
    const secret = env.JWT_SECRET;
    const options = { expiresIn: env.JWT_EXPIRES_IN };
    return jwt.sign(payload, secret, options);
}
export function signRefresh(payload) {
    const secret = env.JWT_REFRESH_SECRET;
    const options = { expiresIn: env.JWT_REFRESH_EXPIRES_IN };
    return jwt.sign(payload, secret, options);
}
export function verifyAccess(token) {
    return jwt.verify(token, env.JWT_SECRET);
}
export function verifyRefresh(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
