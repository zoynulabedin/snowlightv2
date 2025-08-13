import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { db } from "~/lib/db";
import { VipType } from "@prisma/client";

// GET - Get user's current membership status
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        isVip: true,
        vipType: true,
        vipExpiry: true,
        hearts: true,
      },
    });

    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Check if VIP membership has expired
    const now = new Date();
    const isVipActive = user.isVip && user.vipExpiry && user.vipExpiry > now;

    return json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        hearts: user.hearts,
      },
      membership: {
        isVip: isVipActive,
        vipType: isVipActive ? user.vipType : null,
        vipExpiry: user.vipExpiry,
        daysRemaining:
          isVipActive && user.vipExpiry
            ? Math.ceil(
                (user.vipExpiry.getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching membership:", error);
    return json(
      { error: "Failed to fetch membership status" },
      { status: 500 }
    );
  }
}

// POST - Subscribe to or upgrade membership
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const userId = formData.get("userId") as string;
  const planType = formData.get("planType") as string;
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!userId || !planType) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    if (action === "subscribe") {
      // Calculate expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Determine hearts bonus based on plan
      let heartsBonus = 0;
      switch (planType) {
        case "BASIC":
          heartsBonus = 200;
          break;
        case "PREMIUM":
          heartsBonus = 500;
          break;
        case "PLATINUM":
          heartsBonus = 1000;
          break;
      }

      const result = await db.$transaction(async (tx) => {
        // Update user membership
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            isVip: true,
            vipType: planType as VipType,
            vipExpiry: expiryDate,
            hearts: { increment: heartsBonus },
          },
          select: {
            id: true,
            name: true,
            isVip: true,
            vipType: true,
            vipExpiry: true,
            hearts: true,
          },
        });

        // Add hearts bonus record
        if (heartsBonus > 0) {
          await tx.heartCharge.create({
            data: {
              userId,
              type: "PURCHASE",
              amount: heartsBonus,
              reason: `VIP ${planType} 멤버십 가입 보너스`,
            },
          });
        }

        return updatedUser;
      });

      return json({
        success: true,
        message: "Membership activated successfully",
        membership: {
          isVip: result.isVip,
          vipType: result.vipType,
          vipExpiry: result.vipExpiry,
          heartsAdded: heartsBonus,
        },
        newHeartCount: result.hearts,
      });
    } else if (action === "cancel") {
      // Cancel membership (set expiry to now)
      await db.user.update({
        where: { id: userId },
        data: {
          isVip: false,
          vipType: null,
          vipExpiry: new Date(),
        },
      });

      return json({
        success: true,
        message: "Membership cancelled successfully",
      });
    } else {
      return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing membership:", error);
    return json(
      { error: "Failed to process membership request" },
      { status: 500 }
    );
  }
}
