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
async function createShiprocketForSavedOrder(
  orderNumber: string,
  customerEmail: string
) {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !order) {
    throw new Error("Saved order could not be found");
  }

  if (
    order.customer_email?.toLowerCase() !==
      customerEmail.toLowerCase() ||
    order.payment_method !== "online" ||
    !order.razorpay_payment_id
  ) {
    throw new Error("Order ownership or payment verification failed");
  }

 if (order.shiprocket_order_id || order.shiprocket_shipment_id) {
  return { alreadyCreated: true };
}

if (order.shiprocket_status === "CREATING") {
  throw new Error(
    "Shiprocket creation is already in progress or needs manual verification"
  );
}

  const items = Array.isArray(order.items) ? order.items : [];

  if (!items.length) {
    throw new Error("Saved order has no items");
  }

  const orderItems = [];

  for (const item of items) {
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("name, price")
      .eq("name", item.name)
      .maybeSingle();

    if (productError || !product) {
      throw new Error(`Product not found: ${item.name}`);
    }

    orderItems.push({
      name: product.name,
      sku: product.name.toLowerCase().replace(/\s+/g, "-"),
      units: Number(item.quantity),
      selling_price: Number(product.price),
      discount: 0,
      tax: 0,
      hsn: "",
    });
  }
const { data: claimedOrder, error: claimError } =
  await supabaseAdmin
    .from("orders")
    .update({ shiprocket_status: "CREATING" })
    .eq("order_number", order.order_number)
    .eq("customer_email", customerEmail)
    .is("shiprocket_shipment_id", null)
    .is("shiprocket_order_id", null)
    .neq("shiprocket_status", "CREATING")
    .select("order_number")
    .maybeSingle();

if (claimError || !claimedOrder) {
  throw new Error(
    "Shipping is already processing or needs manual verification"
  );
}
  const authResponse = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  const authData = await authResponse.json();

if (!authResponse.ok || !authData.token) {
  await supabaseAdmin
    .from("orders")
    .update({ shiprocket_status: "NEW" })
    .eq("order_number", order.order_number)
    .eq("customer_email", customerEmail)
    .eq("shiprocket_status", "CREATING")
    .is("shiprocket_shipment_id", null)
    .is("shiprocket_order_id", null);

  throw new Error("Shiprocket authentication failed");
}

  const fullAddress = [order.address, order.area]
    .filter(Boolean)
    .join(", ");

  const shipResponse = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({
        order_id: order.order_number,
        order_date: order.created_at || new Date().toISOString(),
        pickup_location: "home",

        billing_customer_name: order.customer_name,
        billing_last_name: "",
        billing_address: fullAddress,
        billing_city: order.city,
        billing_pincode: String(order.pincode),
        billing_state: order.state,
        billing_country: "India",
        billing_email: order.customer_email,
        billing_phone: String(order.customer_mobile),

        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: "Prepaid",
        sub_total: Number(order.total),

        length: 20,
        breadth: 15,
        height: 10,
        weight: 0.5,
      }),
    }
  );

  const shipData = await shipResponse.json();

  if (!shipResponse.ok || !shipData.shipment_id) {
    throw new Error(
      shipData.message || "Shiprocket order creation failed"
    );
  }

  const { error: saveError } = await supabaseAdmin
    .from("orders")
    .update({
      shiprocket_order_id: shipData.order_id ?? null,
      shiprocket_shipment_id: shipData.shipment_id,
      shiprocket_awb_code: null,
      shiprocket_courier_name: null,
      shiprocket_status: "NEW",
      shiprocket_tracking_url: null,
    })
    .eq("order_number", order.order_number)
    .eq("customer_email", customerEmail)
    .is("shiprocket_shipment_id", null);

  if (saveError) {
    console.error(
      "Shiprocket IDs could not be saved:",
      saveError.message
    );
    throw new Error("Shiprocket created but saving its IDs failed");
  }

  return { alreadyCreated: false };
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
    payment?.status === "captured" &&
    razorpay_payment_id &&
    razorpay_order_id
  ) {
    const { data: existingOrder, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("razorpay_payment_id", razorpay_payment_id)
        .maybeSingle();

    if (orderError) {
      console.error("Invalid-product order lookup failed:", orderError);
    } else if (!existingOrder) {
      const { data: previousRecovery, error: lookupError } =
        await supabaseAdmin
          .from("payment_recovery")
          .select("status")
          .eq("razorpay_payment_id", razorpay_payment_id)
          .maybeSingle();

      if (lookupError) {
        console.error("Invalid-product recovery lookup failed:", lookupError);
      } else if (
        previousRecovery?.status !== "completed" &&
        previousRecovery?.status !== "needs_review"
      ) {
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
          expected_amount_paise: Number(payment.amount),
          status: "needs_review",
          last_error: invalidProduct.slice(0, 1000),
          updated_at: new Date().toISOString(),
        };

        const { error: recoveryError } = previousRecovery
          ? await supabaseAdmin
              .from("payment_recovery")
              .update({
                status: "needs_review",
                last_error: recoveryPayload.last_error,
                updated_at: recoveryPayload.updated_at,
              })
              .eq("razorpay_payment_id", razorpay_payment_id)
              .eq("status", "pending")
          : await supabaseAdmin
              .from("payment_recovery")
              .insert(recoveryPayload);

        if (recoveryError) {
          console.error(
            "Could not save invalid-product payment recovery:",
            recoveryError
          );
        }
      }
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

if (Number(payment.amount) !== expectedAmount) {
  const paymentId = razorpay_payment_id;
  const orderId = razorpay_order_id;

  if (!paymentId || !orderId || payment?.status !== "captured") {
    return NextResponse.json(
      { error: "Payment amount mismatch" },
      { status: 400 }
    );
  }

  // Never create a recovery record over an existing order.
  const { data: existingOrder, error: orderLookupError } =
    await supabaseAdmin
      .from("orders")
      .select("id, order_number")
      .eq("razorpay_payment_id", paymentId)
      .maybeSingle();

  if (orderLookupError) {
    console.error("Amount mismatch order lookup failed:", orderLookupError);

    return NextResponse.json(
      {
        error: "Payment needs manual verification.",
        recoveryRequired: true,
        paymentId,
      },
      { status: 500 }
    );
  }

  if (existingOrder) {
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

  const { data: previousRecovery, error: recoveryLookupError } =
    await supabaseAdmin
      .from("payment_recovery")
      .select("status")
      .eq("razorpay_payment_id", paymentId)
      .maybeSingle();

  if (recoveryLookupError) {
    console.error("Recovery lookup failed:", recoveryLookupError);

    return NextResponse.json(
      {
        error: "Payment needs manual verification.",
        recoveryRequired: true,
        paymentId,
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
        error: "This payment requires manual verification.",
        recoveryRequired: true,
        paymentId,
      },
      { status: 409 }
    );
  }

  const recoveryPayload = {
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
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
    last_error: "Captured payment amount does not match verified product total.",
    updated_at: new Date().toISOString(),
  };

  const recoveryWrite = previousRecovery
    ? await supabaseAdmin
        .from("payment_recovery")
        .update({
          status: "needs_review",
          expected_amount_paise: Number(payment.amount),
          last_error: recoveryPayload.last_error,
          updated_at: recoveryPayload.updated_at,
        })
        .eq("razorpay_payment_id", paymentId)
        .eq("status", "pending")
    : await supabaseAdmin
        .from("payment_recovery")
        .insert(recoveryPayload);

  if (recoveryWrite.error) {
    console.error("Could not save amount mismatch recovery:", recoveryWrite.error);
  }

  return NextResponse.json(
    {
      error:
        "Payment was captured, but the amount does not match. Contact support with your Razorpay payment ID.",
      recoveryRequired: true,
      paymentId,
    },
    { status: 409 }
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
  const { error: recoveryUpdateError } = await supabaseAdmin
    .from("payment_recovery")
    .update({
      status: "completed",
      order_number: existingOrder.order_number,
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_payment_id", razorpay_payment_id);

  if (recoveryUpdateError) {
    console.error(
      "Recovery update failed:",
      recoveryUpdateError.message
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
      shippingMessage:
        "Existing order found. Check Shiprocket status before retrying.",
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

  const { error: recoveryError } = previousRecovery
  ? await supabaseAdmin
      .from("payment_recovery")
      .update({
        status: "needs_review",
        last_error: recoveryPayload.last_error,
        updated_at: recoveryPayload.updated_at,
      })
      .eq("razorpay_payment_id", razorpay_payment_id)
      .eq("status", "pending")
  : await supabaseAdmin
      .from("payment_recovery")
      .insert(recoveryPayload);

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
let shippingCreated = false;
let shippingMessage = "Not applicable";

if (payment_method === "online" && razorpay_payment_id) {
  const { data: savedOrder, error: savedOrderError } =
    await supabaseAdmin
      .from("orders")
      .select("order_number")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();

  if (savedOrderError || !savedOrder) {
    console.error(
      "Order saved, but Shiprocket lookup failed:",
      savedOrderError?.message
    );
    shippingMessage = "Order saved; shipping needs manual review";
  } else {
    try {
      await createShiprocketForSavedOrder(
        savedOrder.order_number,
        user.email
      );

      shippingCreated = true;
      shippingMessage = "Shiprocket order created; AWB/pickup pending";
    } catch (shippingError) {
      console.error("Shiprocket creation failed:", shippingError);
      shippingMessage = "Order saved; Shiprocket creation needs retry";
    }
  }
}
return NextResponse.json(
  {
    success: true,
    duplicate: data?.duplicate === true,
    order: data,
    shippingCreated,
    shippingMessage,
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