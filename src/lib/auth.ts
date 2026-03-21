import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

if (!process.env.JWT_SECRET) {
  console.warn("AUTH LIB: JWT_SECRET is not defined in environment variables! Using default.");
}

export interface UserToken {
  id: string;
  role: string;
}

export function signToken(payload: { id: { toString(): string }; role: string }) {
  const cleanPayload = {
    id: payload.id.toString(),
    role: payload.role,
  };
  console.log("AUTH LIB: Signing token for user:", cleanPayload.id);
  return jwt.sign(cleanPayload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as UserToken;
    console.log("AUTH LIB: Token verified successfully for user:", decoded.id);
    return decoded;
  } catch (err: unknown) {
    console.error("AUTH LIB: JWT VERIFY ERROR:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

