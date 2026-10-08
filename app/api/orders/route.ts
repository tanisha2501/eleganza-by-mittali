import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

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
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("Razorpay secret is not configured");
  }

  const body = `${orderId}|${paymentId}`;

  const expectedSignature = createHmac(
    "sha256",
    secret
  )
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8"
  );

  const receivedBuffer = Buffer.from(
    signature,
    "utf8"
  );

  if (
    expectedBuffer.length !== receivedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

export async function POST(request: Request) {
  try {
        const user = await getAuthenticatedUser(request);

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();

    const {
      customer_name,
      customer_mobile,
      address,
      area,
      city,
      pincode,
      state,
      payment_method,
      items,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (
      !customer_name ||
      !customer_mobile ||
      !address ||
      !area ||
      !city ||
      !pincode ||
      !state ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Missing required order details",
        },
        { status: 400 }
      );
    }

if (
  payment_method !== "online" &&
  payment_method !== "cod"
) {
  return NextResponse.json(
    {
      error: "Invalid payment method",
    },
    { status: 400 }
  );
}

if (payment_method === "cod") {
  return NextResponse.json(
    {
      error: "Cash on Delivery is currently unavailable. Please use online payment.",
    },
    { status: 400 }
  );
}

    let verifiedTotal = 0;

    for (const item of items) {
      const { data: product, error } =
        await supabaseAdmin
          .from("products")
          .select("name, price, sizes")
          .eq("name", item.name)
          .single();

      if (error || !product) {
        return NextResponse.json(
          {
            error: `Product not found: ${item.name}`,
          },
          { status: 400 }
        );
      }

      const colour = item.colour || "Default";
      const size = item.size;
      const quantity = Number(item.quantity);

      if (!size || quantity <= 0) {
        return NextResponse.json(
          {
            error: `Invalid item details for ${item.name}`,
          },
          { status: 400 }
        );
      }

      const sizes = product.sizes || {};

      let availableStock = 0;

      if (
        sizes[colour] &&
        typeof sizes[colour] === "object"
      ) {
        availableStock = Number(
          sizes[colour][size] ?? 0
        );
      } else {
        availableStock = Number(
          sizes[size] ?? 0
        );
      }

      if (availableStock < quantity) {
        return NextResponse.json(
          {
            error: `Not enough stock for ${item.name} (${colour}, ${size})`,
          },
          { status: 400 }
        );
      }

      verifiedTotal +=
        Number(product.price) * quantity;
    }

    if (verifiedTotal <= 0) {
      return NextResponse.json(
        {
          error: "Invalid order amount",
        },
        { status: 400 }
      );
    }

    if (payment_method === "online") {
      if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature
      ) {
        return NextResponse.json(
          {
            error:
              "Missing Razorpay payment verification details",
          },
          { status: 400 }
        );
      }

      const isValid =
        verifyRazorpaySignature(
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        );

      if (!isValid) {
        return NextResponse.json(
          {
            error: "Payment verification failed",
          },
          { status: 400 }
        );
      }

      const payment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );

      if (
        payment.order_id !==
        razorpay_order_id
      ) {
        return NextResponse.json(
          {
            error:
              "Payment order mismatch",
          },
          { status: 400 }
        );
      }

      if (payment.status !== "captured") {
        return NextResponse.json(
          {
            error:
              "Payment has not been captured",
          },
          { status: 400 }
        );
      }

      const expectedAmount = Math.round(
        verifiedTotal * 100
      );

      if (
        Number(payment.amount) !==
        expectedAmount
      ) {
        return NextResponse.json(
          {
            error:
              "Payment amount mismatch",
          },
          { status: 400 }
        );
      }
    }

    const { data, error } =
      await supabaseAdmin.rpc(
        "create_order_atomic",
        {
          p_order_number: `ELG-${Math.floor(
            100000 +
              Math.random() * 900000
          )}`,
          p_customer_name:
            customer_name,
            p_customer_email:
          user.email,
          p_customer_mobile:
            customer_mobile,
          p_address: address,
          p_area: area,
          p_city: city,
          p_pincode: pincode,
          p_state: state,
          p_payment_method:
            payment_method,
          p_razorpay_order_id:
            razorpay_order_id || null,
          p_razorpay_payment_id:
            razorpay_payment_id || null,
          p_razorpay_signature:
            razorpay_signature || null,
          p_items: items,
        }
      );

    if (error) {
      console.error(
        "Order creation error:",
        error
      );

      return NextResponse.json(
        {
          error: "Could not create order",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Invalid request",
      },
      { status: 400 }
    );
  }
}