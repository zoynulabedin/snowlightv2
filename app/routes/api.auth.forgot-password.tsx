import { json, type ActionFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db";
import { generateResetToken, sendPasswordResetEmail } from "~/lib/auth";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return json({
        success: true,
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
    }

    // Delete any existing password reset tokens for this user (using raw SQL as workaround)
    await db.$executeRaw`DELETE FROM password_resets WHERE "userId" = ${user.id}`;

    // Generate a new reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the reset token (using raw SQL as workaround)
    await db.$executeRaw`
      INSERT INTO password_resets ("id", "userId", "token", "expiresAt", "used", "createdAt")
      VALUES (gen_random_uuid(), ${user.id}, ${resetToken}, ${expiresAt}, false, NOW())
    `;

    // Send the reset email (mock implementation)
    await sendPasswordResetEmail(
      user.email,
      user.name || user.username,
      resetToken
    );

    return json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
