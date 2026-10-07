import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
async function getAuthenticatedAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user || !user.email) {
    return null;
  }

  if (user.email.toLowerCase() !== "mittaligoyal2602@gmail.com") {
    return null;
  }

  return user;
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedAdmin(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      order_id,
      order_date,
      billing_customer_name,
      billing_last_name,
      billing_address,
      billing_city,
      billing_pincode,
      billing_state,
      billing_country,
      billing_email,
      billing_phone,
      shipping_is_billing,
      shipping_customer_name,
      shipping_last_name,
      shipping_address,
      shipping_city,
      shipping_pincode,
      shipping_state,
      shipping_country,
      shipping_email,
      shipping_phone,
      order_items,
      payment_method,
      sub_total,
      length,
      breadth,
      height,
      weight,
    } = body;

    if (
      !order_id ||
      !billing_customer_name ||
      !billing_address ||
      !billing_city ||
      !billing_pincode ||
      !billing_state ||
      !billing_phone ||
      !order_items
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Required order details are missing",
        },
        { status: 400 }
      );
    }

    // 1. Get Shiprocket token
    const authResponse = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD,
        }),
      }
    );

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.token) {
      return NextResponse.json(
        {
          success: false,
          error: "Shiprocket authentication failed",
          details: authData,
        },
        { status: 500 }
      );
    }

    // 2. Create order in Shiprocket
    const orderResponse = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          order_id,
          order_date: order_date || new Date().toISOString(),
          pickup_location: "home",

          billing_customer_name,
          billing_last_name: billing_last_name || "",
          billing_address,
          billing_city,
          billing_pincode,
          billing_state,
          billing_country: billing_country || "India",
          billing_email: billing_email || "",
          billing_phone,

          shipping_is_billing: shipping_is_billing ?? true,

          shipping_customer_name:
            shipping_customer_name || billing_customer_name,
          shipping_last_name:
            shipping_last_name || billing_last_name || "",
          shipping_address:
            shipping_address || billing_address,
          shipping_city:
            shipping_city || billing_city,
          shipping_pincode:
            shipping_pincode || billing_pincode,
          shipping_state:
            shipping_state || billing_state,
          shipping_country:
            shipping_country || "India",
          shipping_email:
            shipping_email || billing_email || "",
          shipping_phone:
            shipping_phone || billing_phone,

          order_items,

          payment_method:
            payment_method || "Prepaid",

          sub_total: Number(sub_total),

          length: Number(length) || 20,
          breadth: Number(breadth) || 15,
          height: Number(height) || 10,
          weight: Number(weight) || 0.5,
        }),
      }
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Shiprocket order creation failed",
          details: orderData,
        },
        { status: orderResponse.status }
      );
    }

    // 3. Get Shiprocket Order and Shipment IDs
    const shiprocketOrderId =
      orderData?.order_id ?? null;

    const shiprocketShipmentId =
      orderData?.shipment_id ?? null;

    if (!shiprocketShipmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shiprocket shipment ID was not generated",
          details: orderData,
        },
        { status: 500 }
      );
    }

    /*
      4. AWB ASSIGNMENT TEMPORARILY SKIPPED

      Shiprocket requires minimum wallet balance of ₹100
      for courier/AWB assignment.

      So for testing we are NOT calling:

      /courier/assign/awb

      This means:
      - Order will be created
      - Shipment ID will be saved
      - AWB will remain null
      - Courier will remain null
      - Status will remain NEW
    */

    const shiprocketAwbCode = null;
    const shiprocketCourierName = null;
    const shiprocketStatus = "NEW";
    const shiprocketTrackingUrl = null;

    // 5. Save Shiprocket details in Supabase
    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          shiprocket_order_id:
            shiprocketOrderId,

          shiprocket_shipment_id:
            shiprocketShipmentId,

          shiprocket_awb_code:
            shiprocketAwbCode,

          shiprocket_courier_name:
            shiprocketCourierName,

          shiprocket_status:
            shiprocketStatus,

          shiprocket_tracking_url:
            shiprocketTrackingUrl,
        })
        .eq("order_number", order_id);

    if (updateError) {
      console.error(
        "Shiprocket details save failed:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Shiprocket details could not be saved",
          details: updateError.message,

          shiprocket_order_id:
            shiprocketOrderId,

          shiprocket_shipment_id:
            shiprocketShipmentId,
        },
        { status: 500 }
      );
    }

    // 6. Return successful response
    return NextResponse.json({
      success: true,

      message:
        "Shiprocket order created successfully. AWB assignment skipped for testing.",

      data: {
        ...orderData,

        shiprocket_order_id:
          shiprocketOrderId,

        shiprocket_shipment_id:
          shiprocketShipmentId,

        shiprocket_awb_code:
          shiprocketAwbCode,

        shiprocket_courier_name:
          shiprocketCourierName,

        shiprocket_status:
          shiprocketStatus,

        shiprocket_tracking_url:
          shiprocketTrackingUrl,
      },
    });
  } catch (error) {
    console.error(
      "Shiprocket create order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}