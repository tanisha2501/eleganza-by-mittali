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
let payment: any = null;

if (payment_method === "online") {
  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature
  ) {
    return NextResponse.json(
      { error: "Missing Razorpay payment verification details" },
      { status: 400 }
    );
  }

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 }
    );
  }

  payment = await razorpay.payments.fetch(razorpay_payment_id);

  if (payment.order_id !== razorpay_order_id) {
    return NextResponse.json(
      { error: "Payment order mismatch" },
      { status: 400 }
    );
  }

  if (payment.status !== "captured") {
    return NextResponse.json(
      { error: "Payment has not been captured" },
      { status: 400 }
    );
  }
}
let verifiedTotal = 0;
let stockIssue: string | null = null;
let invalidProduct: string | null = null;

for (const item of items) {
  const quantity = Number(item.quantity);

  if (
    !item.name ||
    !item.size ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return NextResponse.json(
      { error: `Invalid item details for ${item.name || "unknown product"}` },
      { status: 400 }
    );
  }

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("name, price, sizes")
    .eq("name", item.name)
    .maybeSingle();

  if (error || !product) {
    invalidProduct = `Product not found: ${item.name}`;
    break;
  }

  const colour = item.colour || "Default";
  const size = item.size;
  const sizes = product.sizes || {};

  const availableStock =
    sizes[colour] && typeof sizes[colour] === "object"
      ? Number(sizes[colour][size] ?? 0)
      : Number(sizes[size] ?? 0);

  if (availableStock < quantity) {
    stockIssue ??=
      `Not enough stock for ${item.name} (${colour}, ${size}). ` +
      `Available: ${availableStock}, requested: ${quantity}`;
  }

  const price = Number(product.price);

  if (!Number.isFinite(price) || price <= 0) {
    invalidProduct = `Invalid product price: ${item.name}`;
    break;
  }

  verifiedTotal += price * quantity;
}
if (invalidProduct) {
  if (
    payment_method === "online" &&
    payment &&
    razorpay_payment_id &&
    razorpay_order_id
  ) {
    const { error: recoveryError } = await supabaseAdmin
      .from("payment_recovery")
      .upsert(
        {
          razorpay_payment_id,
          razorpay_order_id,
          customer_id: user.id,
          customer_email: user.email,
          customer_name,
          customer_mobile,
          address,
          area,
          city,
          pincode,
          state,
          items,
          expected_amount_paise: Number(payment.amount),
          status: "needs_review",
          last_error: invalidProduct.slice(0, 1000),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "razorpay_payment_id" }
      );

    if (recoveryError) {
      console.error(
        "CRITICAL: Could not save invalid-product payment recovery",
        recoveryError
      );
    }
  }

  return NextResponse.json(
    {
      error:
        "A product could not be verified. If your payment was captured, contact support with your Razorpay payment ID.",
      recoveryRequired: payment?.status === "captured",
      paymentId: razorpay_payment_id || null,
    },
    { status: 409 }
  );
}

    if (verifiedTotal <= 0) {
      return NextResponse.json(
        {
          error: "Invalid order amount",
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
    // Recover an order already created for this verified payment.
    if (razorpay_payment_id) {
      const {
        data: existingOrder,
        error: lookupError,
      } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("razorpay_payment_id", razorpay_payment_id)
        .maybeSingle();

      if (lookupError) {
        console.error(
          "Existing order lookup failed:",
          lookupError
        );

        return NextResponse.json(
          {
            error:
              "Could not verify the existing order. Please contact support.",
            recoveryRequired: true,
            paymentId: razorpay_payment_id,
          },
          { status: 500 }
        );
      }

      if (existingOrder) {
        // Mark recovery completed if a recovery record exists.
        const { error: recoveryUpdateError } =
          await supabaseAdmin
            .from("payment_recovery")
            .update({
              status: "completed",
              order_number: existingOrder.order_number,
              last_error: null,
              updated_at: new Date().toISOString(),
            })
            .eq(
              "razorpay_payment_id",
              razorpay_payment_id
            );

        if (recoveryUpdateError) {
          console.error(
            "Could not update existing payment recovery record:",
            recoveryUpdateError
          );
        }

        return NextResponse.json(
          {
            success: true,
            duplicate: true,
            order: {
              order_id: existingOrder.id,
              order_number: existingOrder.order_number,
            },
          },
          { status: 200 }
        );
      }
    }
    if (
  payment_method === "online" &&
  razorpay_payment_id &&
  razorpay_order_id &&
  stockIssue
) {
  const { data: previousRecovery, error: previousRecoveryError } =
  await supabaseAdmin
    .from("payment_recovery")
    .select("status")
    .eq("razorpay_payment_id", razorpay_payment_id)
    .maybeSingle();

if (previousRecoveryError) {
  console.error(
    "Could not check existing recovery status:",
    previousRecoveryError
  );

  return NextResponse.json(
    {
      error: "Payment recovery needs manual verification.",
      recoveryRequired: true,
      paymentId: razorpay_payment_id,
    },
    { status: 500 }
  );
}

if (
  previousRecovery?.status === "needs_review" ||
  previousRecovery?.status === "completed"
) {
  return NextResponse.json(
    {
      error:
        "This payment is already under manual review. Please contact support.",
      recoveryRequired: true,
      paymentId: razorpay_payment_id,
    },
    { status: 409 }
  );
}
  const recoveryPayload = {
    razorpay_payment_id,
    razorpay_order_id,
    customer_id: user.id,
    customer_email: user.email,
    customer_name,
    customer_mobile,
    address,
    area,
    city,
    pincode,
    state,
    items,
    expected_amount_paise: Math.round(verifiedTotal * 100),
    status: "needs_review",
    last_error: stockIssue.slice(0, 1000),
    updated_at: new Date().toISOString(),
  };

  const { error: recoveryError } = await supabaseAdmin
    .from("payment_recovery")
    .upsert(recoveryPayload, {
      onConflict: "razorpay_payment_id",
    });

  if (recoveryError) {
    console.error("CRITICAL: Could not save stock-related payment recovery.", {
      paymentId: razorpay_payment_id,
      error: recoveryError.message,
    });

    return NextResponse.json(
      {
        error:
          "Your payment may have succeeded, but stock needs to be reviewed. Contact support with your Razorpay payment ID.",
        recoveryRequired: true,
        paymentId: razorpay_payment_id,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error:
        "Payment verified, but the requested stock is unavailable. Your payment requires manual review.",
      recoveryRequired: true,
      paymentId: razorpay_payment_id,
    },
    { status: 409 }
  );
}

    const rpcArgs = {
      p_order_number: `ELG-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
      p_customer_name: customer_name,
      p_customer_email: user.email,
      p_customer_mobile: customer_mobile,
      p_address: address,
      p_area: area,
      p_city: city,
      p_pincode: pincode,
      p_state: state,
      p_payment_method: payment_method,
      p_razorpay_order_id: razorpay_order_id || null,
      p_razorpay_payment_id: razorpay_payment_id || null,
      p_razorpay_signature: razorpay_signature || null,
      p_items: items,
    };

    // Save verified payment details for recovery.
    if (
      payment_method === "online" &&
      razorpay_payment_id &&
      razorpay_order_id
    ) {
      const {
        data: previousRecovery,
        error: previousRecoveryError,
      } = await supabaseAdmin
        .from("payment_recovery")
        .select("status")
        .eq("razorpay_payment_id", razorpay_payment_id)
        .maybeSingle();

      if (previousRecoveryError) {
        return NextResponse.json(
          {
            error: "Could not verify payment recovery status.",
            recoveryRequired: true,
            paymentId: razorpay_payment_id,
          },
          { status: 500 }
        );
      }

      if (previousRecovery?.status === "needs_review") {
        return NextResponse.json(
          {
            error: "This payment requires manual review.",
            recoveryRequired: true,
            paymentId: razorpay_payment_id,
          },
          { status: 409 }
        );
      }
      const recoveryPayload = {
        razorpay_payment_id,
        razorpay_order_id,
        customer_id: user.id,
        customer_email: user.email,
        customer_name,
        customer_mobile,
        address,
        area,
        city,
        pincode,
        state,
        items,
        expected_amount_paise: Math.round(
          verifiedTotal * 100
        ),
        status: "pending",
        last_error: null,
        updated_at: new Date().toISOString(),
      };

let recoveryResult = await supabaseAdmin
  .from("payment_recovery")
  .upsert(recoveryPayload, {
    onConflict: "razorpay_payment_id",
    ignoreDuplicates: true,
  });

// Retry saving the recovery record once.
if (recoveryResult.error) {
  console.error(
    "First recovery save attempt failed:",
    recoveryResult.error
  );

  recoveryResult = await supabaseAdmin
  .from("payment_recovery")
  .upsert(recoveryPayload, {
    onConflict: "razorpay_payment_id",
    ignoreDuplicates: true,
  });
}

if (recoveryResult.error) {
  console.error(
    "CRITICAL: Recovery record could not be saved after retry.",
    {
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      error: recoveryResult.error.message,
    }
  );

  return NextResponse.json(
    {
      error:
        "We could not save the payment recovery details. Your payment may have succeeded. Please contact support with your Razorpay payment ID.",
      recoveryRequired: true,
      paymentId: razorpay_payment_id,
    },
    { status: 500 }
  );
}

    }
     let rpcResult = await supabaseAdmin.rpc(
      "create_order_atomic",
      rpcArgs
    );

    // Retry once with the SAME payment ID if the database call fails.
    if (rpcResult.error && payment_method === "online") {
      console.error(
        "First order creation attempt failed; retrying:",
        rpcResult.error
      );

      rpcResult = await supabaseAdmin.rpc(
        "create_order_atomic",
        rpcArgs
      );
    }
    const { data, error } = rpcResult;

    if (error) {
  console.error("Order creation failed after retry:", error);

  if (
    payment_method === "online" &&
    razorpay_payment_id
  ) {
    const {
      data: recoveryRecord,
      error: recoveryReadError,
    } = await supabaseAdmin
      .from("payment_recovery")
      .select("attempts")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (recoveryReadError) {
      console.error(
        "Could not read payment recovery attempts:",
        recoveryReadError
      );
    }

    const nextAttempts =
      Number(recoveryRecord?.attempts ?? 0) + 1;

    const { error: recoveryUpdateError } = await supabaseAdmin
      .from("payment_recovery")
      .update({
        attempts: nextAttempts,
        last_error: String(error.message || error).slice(0, 1000),
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_payment_id", razorpay_payment_id)
      .eq("status", "pending");

    if (recoveryUpdateError) {
      console.error(
        "Could not update failed order recovery record:",
        recoveryUpdateError
      );
    }
  }

  return NextResponse.json(
    {
      error:
        "Payment verification succeeded, but order creation needs recovery. Please contact support and provide your Razorpay payment ID.",
      recoveryRequired: true,
      paymentId: razorpay_payment_id || null,
    },
    { status: 500 }
  );
}
// Order creation succeeded: mark recovery as completed.
if (payment_method === "online" && razorpay_payment_id) {
  const { error: recoveryCompleteError } = await supabaseAdmin
    .from("payment_recovery")
    .update({
      status: "completed",
      order_number: data?.order_number || null,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_payment_id", razorpay_payment_id)
    .eq("status", "pending");

  if (recoveryCompleteError) {
    console.error(
      "Order created, but recovery record could not be marked completed:",
      recoveryCompleteError
    );
  }
}

return NextResponse.json(
  {
    success: true,
    duplicate: data?.duplicate === true,
    order: data,
  },
  { status: data?.duplicate === true ? 200 : 201 }
);

} catch (error) {
  console.error("Order API error:", error);

  return NextResponse.json(
    {
      error:
        "We could not complete your order request. If your payment was successful, please contact support with your Razorpay payment ID.",
      recoveryRequired: true,
    },
    { status: 500 }
  );
}
}