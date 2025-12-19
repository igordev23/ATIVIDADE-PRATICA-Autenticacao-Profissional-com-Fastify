import jwt from "jsonwebtoken";
import redis from "../db/clienteRedis";
import { User } from "../types/user";

const ACCESS_SECRET = "segredo";
const REFRESH_SECRET = "refresh-secreto";

const ACCESS_TOKEN_TTL = 30; // segundos

/* ================= TOKENS ================= */

export function generateAccessToken(user: User) {
  return jwt.sign(
    { id: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: `${ACCESS_TOKEN_TTL}s` }
  );
}

export function generateRefreshToken(user: User) {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: "10m" }
  );
}

/* ================= REDIS ================= */

async function ensureRedisConnection() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function saveAccessTokenInCache(
  userId: number,
  token: string
) {
  await redis.set(
    `access_token:${userId}`,
    token,
    { EX: ACCESS_TOKEN_TTL }
  );
}

export async function getAccessTokenFromCache(userId: number) {
  return redis.get(`access_token:${userId}`);
}

export async function deleteAccessTokenFromCache(userId: number) {
  await redis.del(`access_token:${userId}`);
}

/* ================= VALIDAÇÃO ================= */

export async function verifyAccessToken(token: string) {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as {
      id: number;
      email: string;
    };

    const cachedToken = await getAccessTokenFromCache(decoded.id);

    if (!cachedToken || cachedToken !== token) {
      throw new Error("Token inválido ou expirado no Redis");
    }

    return decoded;
  } catch (err) {
    throw new Error("Token inválido ou expirado");
  }
}
