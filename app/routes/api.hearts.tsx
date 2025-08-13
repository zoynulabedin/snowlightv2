import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { db } from "~/lib/db";
import { HeartChargeType } from "@prisma/client";

// GET - Get user's current hearts and recent history
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Get user's current hearts
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { hearts: true, name: true, username: true },
    });

    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Get recent heart history
    const heartHistory = await db.heartCharge.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    return json({
      currentHearts: user.hearts,
      user: { name: user.name, username: user.username },
      history: heartHistory,
    });
  } catch (error) {
    console.error("Error fetching hearts:", error);
    return json({ error: "Failed to fetch hearts" }, { status: 500 });
  }
}

// POST - Add/spend hearts
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const userId = formData.get("userId") as string;
  const amount = parseInt(formData.get("amount") as string);
  const type = formData.get("type") as string;
  const reason = formData.get("reason") as string;

  if (!userId || !amount || !type) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    if (action === "add") {
      // Add hearts to user account
      const result = await db.$transaction(async (tx) => {
        // Update user hearts
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { hearts: { increment: amount } },
          select: { hearts: true },
        });

        // Create heart charge record
        await tx.heartCharge.create({
          data: {
            userId,
            type: type as HeartChargeType,
            amount,
            reason,
          },
        });

        return updatedUser;
      });

      return json({
        success: true,
        newHeartCount: result.hearts,
        message: "Hearts added successfully",
      });
    } else if (action === "spend") {
      // Check if user has enough hearts
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { hearts: true },
      });

      if (!user || user.hearts < amount) {
        return json({ error: "Insufficient hearts" }, { status: 400 });
      }

      // Spend hearts
      const result = await db.$transaction(async (tx) => {
        // Update user hearts
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { hearts: { decrement: amount } },
          select: { hearts: true },
        });

        // Create heart charge record (negative amount for spending)
        await tx.heartCharge.create({
          data: {
            userId,
            type: "SPEND",
            amount: -amount,
            reason,
          },
        });

        return updatedUser;
      });

      return json({
        success: true,
        newHeartCount: result.hearts,
        message: "Hearts spent successfully",
      });
    } else {
      return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing hearts:", error);
    return json(
      { error: "Failed to process hearts transaction" },
      { status: 500 }
    );
  }
}
