import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config.js';

export type JwtPayload = { sub: string; uid: string; isAdmin?: boolean } & Record<string, any>;

export function signAccess(payload: JwtPayload) {
  const secret: Secret = env.JWT_SECRET as unknown as Secret;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  return jwt.sign(payload, secret, options);
}

export function signRefresh(payload: JwtPayload) {
  const secret: Secret = env.JWT_REFRESH_SECRET as unknown as Secret;
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
  return jwt.sign(payload, secret, options);
}

export function verifyAccess(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET as unknown as Secret) as JwtPayload;
}

export function verifyRefresh(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as unknown as Secret) as JwtPayload;
}
