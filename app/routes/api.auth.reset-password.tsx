import { json, type ActionFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db";
import { hashPassword, verifyResetToken } from "~/lib/auth";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;

    if (!token || !password) {
      return json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Verify the reset token
    if (!verifyResetToken(token)) {
      return json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Find the password reset record (using raw SQL as workaround)
    const passwordResetData = await db.$queryRaw<
      Array<{
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
        used: boolean;
        email: string;
      }>
    >`
      SELECT pr.*, u.email 
      FROM password_resets pr 
      JOIN users u ON pr."userId" = u.id 
      WHERE pr.token = ${token} 
        AND pr.used = false 
        AND pr."expiresAt" > NOW()
      LIMIT 1
    `;

    if (!passwordResetData || passwordResetData.length === 0) {
      return json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const passwordReset = passwordResetData[0];

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password and mark reset token as used using transaction
    await db.$transaction([
      db.$executeRaw`UPDATE users SET password = ${hashedPassword} WHERE id = ${passwordReset.userId}`,
      db.$executeRaw`UPDATE password_resets SET used = true WHERE id = ${passwordReset.id}`,
      db.$executeRaw`DELETE FROM sessions WHERE "userId" = ${passwordReset.userId}`,
    ]);

    return json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
