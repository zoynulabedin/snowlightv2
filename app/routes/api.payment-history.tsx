import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { db } from "~/lib/db";

// GET - Get user's payment history
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Get user's payment history from HeartCharge table
    const paymentHistory = await db.heartCharge.findMany({
      where: {
        userId,
        type: "PURCHASE",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    // Calculate total hearts purchased
    const totalPurchased = await db.heartCharge.aggregate({
      where: {
        userId,
        type: "PURCHASE",
      },
      _sum: {
        amount: true,
      },
    });

    // Get monthly purchases
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyPurchased = await db.heartCharge.aggregate({
      where: {
        userId,
        type: "PURCHASE",
        createdAt: {
          gte: currentMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return json({
      paymentHistory,
      totalPurchased: totalPurchased._sum.amount || 0,
      monthlyPurchased: monthlyPurchased._sum.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return json({ error: "Failed to fetch payment history" }, { status: 500 });
  }
}

// POST - Log payment transaction or process refund
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "log_payment") {
    return await logPaymentTransaction(formData);
  } else if (action === "request_refund") {
    return await processRefund(formData);
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }
}

async function logPaymentTransaction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const amount = parseInt(formData.get("amount") as string);
  const hearts = parseInt(formData.get("hearts") as string);
  const packageId = formData.get("packageId") as string;

  if (!userId || !paymentMethod || !amount || !hearts || !packageId) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Create payment record in HeartCharge table
    const paymentRecord = await db.heartCharge.create({
      data: {
        userId,
        type: "PURCHASE",
        amount: hearts,
        reason: `결제 완료 - ${packageId} 패키지 (${paymentMethod}) - ₩${amount.toLocaleString()}`,
      },
    });

    return json({
      success: true,
      paymentId: paymentRecord.id,
      message: "Payment logged successfully",
    });
  } catch (error) {
    console.error("Error logging payment:", error);
    return json({ error: "Failed to log payment" }, { status: 500 });
  }
}

async function processRefund(formData: FormData) {
  const userId = formData.get("userId") as string;
  const paymentId = formData.get("paymentId") as string;
  const reason = formData.get("reason") as string;

  if (!userId || !paymentId) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Find the original payment
    const originalPayment = await db.heartCharge.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!originalPayment) {
      return json({ error: "Payment not found" }, { status: 404 });
    }

    if (originalPayment.userId !== userId) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if refund is within 7 days
    const paymentDate = new Date(originalPayment.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference > 7) {
      return json(
        {
          error: "환불 기간이 지났습니다. (결제 후 7일 이내만 전액 환불 가능)",
        },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      // Deduct hearts from user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          hearts: { decrement: originalPayment.amount },
        },
        select: { hearts: true },
      });

      // Check if user has enough hearts to deduct
      if (updatedUser.hearts < 0) {
        throw new Error("Insufficient hearts for refund");
      }

      // Create refund record (using SPEND type since REFUND is not in the enum yet)
      const refundRecord = await tx.heartCharge.create({
        data: {
          userId,
          type: "SPEND",
          amount: -originalPayment.amount,
          reason: `환불 처리 - ${reason || "사용자 요청"} (원결제: ${
            originalPayment.reason
          })`,
        },
      });

      return { refundRecord, newHeartBalance: updatedUser.hearts };
    });

    return json({
      success: true,
      refundId: result.refundRecord.id,
      newHeartBalance: result.newHeartBalance,
      message: "환불이 처리되었습니다. 영업일 기준 3-5일 내에 환불됩니다.",
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    if (
      error instanceof Error &&
      error.message === "Insufficient hearts for refund"
    ) {
      return json(
        {
          error:
            "환불에 필요한 하트가 부족합니다. 이미 사용한 하트는 환불할 수 없습니다.",
        },
        { status: 400 }
      );
    }
    return json({ error: "Failed to process refund" }, { status: 500 });
  }
}
