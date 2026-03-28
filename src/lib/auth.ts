import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined. Add it to .env.local");
}

export interface UserToken {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

export function signToken(payload: { id: { toString(): string }; role: string }) {
  const cleanPayload = { id: payload.id.toString(), role: payload.role };
  return jwt.sign(cleanPayload, JWT_SECRET!, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET!) as unknown as UserToken;
  } catch (err: unknown) {
    console.error("AUTH LIB: JWT VERIFY ERROR:", err instanceof Error ? err.message : String(err));
    return null;
  }
}