import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secretkey";

export interface UserToken {
  id: string;
  role: string;
}

export function signToken(payload: { id: { toString(): string }; role: string }) {
  // Ensure the ID is always a string to avoid JWT signing issues with Mongoose ObjectIds
  const cleanPayload = {
    ...payload,
    id: payload.id.toString(),
  };
  return jwt.sign(cleanPayload, SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn("AUTH LIB: JWT_SECRET is not defined in environment variables!");
    }
    const decoded = jwt.verify(token, SECRET) as unknown as UserToken;
    return decoded;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("JWT VERIFY ERROR:", err.message);
    } else {
      console.error("JWT VERIFY ERROR:", String(err));
    }
    return null;
  }
}

