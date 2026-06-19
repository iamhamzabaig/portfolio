import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
