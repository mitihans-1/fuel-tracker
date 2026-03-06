import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secretkey";

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}