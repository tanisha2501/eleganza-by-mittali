import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    let total = 0;

    for (const item of items) {
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .select("name, price, sizes")
        .eq("name", item.name)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }

      const colour = item.colour || "Default";
      const size = item.size;

      const colourStock = product.sizes?.[colour];

      if (!colourStock) {
        return NextResponse.json(
          { error: `Colour not found for ${item.name}` },
          { status: 400 }
        );
      }

      const availableStock = Number(colourStock[size] ?? 0);
      const quantity = Number(item.quantity);

      if (quantity <= 0 || availableStock < quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for ${item.name} (${colour}, ${size})`,
          },
          { status: 400 }
        );
      }

      total += Number(product.price) * quantity;
    }

        if (total <= 0) {
        return NextResponse.json(
            { error: "Invalid order amount" },
            { status: 400 }
        );
        }
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      { error: "Unable to create Razorpay order" },
      { status: 500 }
    );
  }
}