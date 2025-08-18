import { Request, Response, NextFunction } from "express";
import prisma from "../lib/db";

export async function basicAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const base64Credentials = authHeader.split(" ")[1];
  const [email, password] = Buffer.from(base64Credentials, "base64")
    .toString("utf-8")
    .split(":");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // attach user to request
  (req as any).user = user;

  next();
}
