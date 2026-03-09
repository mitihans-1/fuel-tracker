import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secretkey";

export interface UserToken {
  id: string;
  role: string;
  iat: number;
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET) as unknown as UserToken;
    return decoded;
  } catch {
    return null;
  }
}
