import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redirect } from "@remix-run/node";
import { db } from "./db";
import type { UserRole, HeartChargeType } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  isAdmin: boolean;
  role: string;
  isVip: boolean;
  vipType?: string;
  hearts: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Enhanced cookie parsing utility
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const token = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  return token || null;
}

// Enhanced session validation with better error handling
export async function validateSessionFromRequest(
  request: Request
): Promise<AuthUser | null> {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return null;
    }

    return await validateSession(token);
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

// Enhanced authorization check for admin routes
export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await validateSessionFromRequest(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

// Enhanced authorization check for admin routes
export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (
    !user.isAdmin &&
    !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)
  ) {
    throw redirect("/login");
  }

  return user;
}

export function generateResetToken(): string {
  return jwt.sign(
    { type: "password_reset", timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function verifyResetToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      type: string;
      timestamp: number;
    };
    return decoded.type === "password_reset";
  } catch {
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  // Mock email sending implementation
  // In production, you would integrate with an email service like SendGrid, Mailgun, etc.
  console.log("📧 Password Reset Email (Mock)");
  console.log("To:", email);
  console.log("Name:", name);
  console.log(
    "Reset Link:",
    `${
      process.env.BASE_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`
  );
  console.log("Token:", resetToken);

  // For development, we'll just log the email
  // In production, replace this with actual email sending logic
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken(userId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function validateSession(token: string): Promise<AuthUser | null> {
  try {
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await db.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      name: session.user.name || undefined,
      avatar: session.user.avatar || undefined,
      isAdmin: session.user.role === "ADMIN",
      role: session.user.role,
      isVip: session.user.vipType !== null,
      vipType: session.user.vipType || undefined,
      hearts: session.user.hearts,
    };
  } catch {
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // Session might not exist
  }
}

export async function createUser(data: {
  email: string;
  username: string;
  password: string;
  name?: string;
  role?: UserRole;
}): Promise<AuthUser> {
  const hashedPassword = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: data.role || "USER",
      hearts: 100, // Welcome bonus
    },
  });

  // Add welcome heart charge
  await db.heartCharge.create({
    data: {
      userId: user.id,
      type: "BONUS",
      amount: 100,
      reason: "Welcome bonus",
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name || undefined,
    avatar: user.avatar || undefined,
    isAdmin: user.role === "ADMIN",
    role: user.role,
    isVip: user.vipType !== null,
    vipType: user.vipType || undefined,
    hearts: user.hearts,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name || undefined,
    avatar: user.avatar || undefined,
    isAdmin: user.role === "ADMIN",
    role: user.role,
    isVip: user.vipType !== null,
    vipType: user.vipType || undefined,
    hearts: user.hearts,
  };
}

export async function addHearts(
  userId: string,
  amount: number,
  type: HeartChargeType,
  reason?: string
): Promise<void> {
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { hearts: { increment: amount } },
    }),
    db.heartCharge.create({
      data: {
        userId,
        type: type,
        amount,
        reason,
      },
    }),
  ]);
}

export async function spendHearts(
  userId: string,
  amount: number,
  reason?: string
): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user || user.hearts < amount) {
    return false;
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { hearts: { decrement: amount } },
    }),
    db.heartCharge.create({
      data: {
        userId,
        type: "SPENT",
        amount: -amount,
        reason,
      },
    }),
  ]);

  return true;
}
