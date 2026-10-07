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

  if (
    user.email.toLowerCase() !==
    "mittaligoyal2602@gmail.com"
  ) {
    return null;
  }

  return user;
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedAdmin(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      exchange_request_id,
      order_number,
      customer_name,
      customer_email,
      customer_mobile,
      exchange_items,
    } = body;

    if (
      !exchange_request_id ||
      !order_number ||
      !customer_name ||
      !customer_mobile ||
      !exchange_items ||
      exchange_items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Required exchange details are missing",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. GET ORIGINAL ORDER ADDRESS
    // ==========================================

    const { data: originalOrder, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select(
          "address, area, city, pincode, state"
        )
        .eq("order_number", order_number)
        .single();

    if (orderError || !originalOrder) {
      console.error(
        "Original order not found:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Original order details could not be found",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 2. CUSTOMER SHIPPING ADDRESS
    // ==========================================

    const shippingAddress =
      originalOrder.address;

    const shippingArea =
      originalOrder.area || "";

    const shippingCity =
      originalOrder.city;

    const shippingPincode =
      originalOrder.pincode;

    const shippingState =
      originalOrder.state;

    if (
      !shippingAddress ||
      !shippingCity ||
      !shippingPincode ||
      !shippingState
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer shipping address is missing from the original order.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. SHIPROCKET LOGIN
    // ==========================================

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

    const authData =
      await authResponse.json();

    if (
      !authResponse.ok ||
      !authData.token
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Shiprocket authentication failed",
          details: authData,
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 4. PREPARE EXCHANGE ITEMS
    // ==========================================

    const exchangeItems =
      exchange_items.map(
        (item: {
          product_name: string;
          old_size: string;
          new_size: string;
          quantity: number;
        }) => ({
          name:
            `${item.product_name} - Size ${item.new_size}`,

          sku:
            `${item.product_name}-${item.new_size}`
              .toLowerCase()
              .replace(/\s+/g, "-"),

          units:
            Number(item.quantity) || 1,

          selling_price: 0,

          discount: 0,

          tax: 0,

          hsn: "",
        })
      );

    // ==========================================
    // 5. UNIQUE EXCHANGE ORDER ID
    // ==========================================

    const exchangeOrderId =
      `EXCHANGE-${order_number}-${exchange_request_id}`;

    // ==========================================
    // 6. CREATE FORWARD SHIPMENT
    // ==========================================

    const shiprocketResponse =
      await fetch(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${authData.token}`,
          },

          body: JSON.stringify({
            order_id:
              exchangeOrderId,

            order_date:
              new Date().toISOString(),

            pickup_location:
              "home",

            // ==================================
            // BILLING = CUSTOMER
            // ==================================

            billing_customer_name:
              customer_name,

            billing_last_name:
              "",

            billing_address:
              shippingAddress,

            billing_address_2:
              shippingArea,

            billing_city:
              shippingCity,

            billing_pincode:
              String(shippingPincode),

            billing_state:
              shippingState,

            billing_country:
              "India",

            billing_email:
              customer_email || "",

            billing_phone:
              String(customer_mobile),

            // ==================================
            // SHIPPING = CUSTOMER
            // ==================================

            shipping_is_billing:
              true,

            shipping_customer_name:
              customer_name,

            shipping_last_name:
              "",

            shipping_address:
              shippingAddress,

            shipping_address_2:
              shippingArea,

            shipping_city:
              shippingCity,

            shipping_pincode:
              String(shippingPincode),

            shipping_state:
              shippingState,

            shipping_country:
              "India",

            shipping_email:
              customer_email || "",

            shipping_phone:
              String(customer_mobile),

            // ==================================
            // NEW SIZE PRODUCT
            // ==================================

            order_items:
              exchangeItems,

            payment_method:
              "Prepaid",

            sub_total:
              0,

            length:
              20,

            breadth:
              15,

            height:
              10,

            weight:
              0.5,
          }),
        }
      );

    const shiprocketData =
      await shiprocketResponse.json();

    console.log(
      "Shiprocket exchange response:",
      shiprocketData
    );

    // ==========================================
    // 7. HANDLE SHIPROCKET ERROR
    // ==========================================

    if (!shiprocketResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Shiprocket exchange order creation failed",
          details:
            shiprocketData,
        },
        {
          status:
            shiprocketResponse.status,
        }
      );
    }

    // ==========================================
    // 8. GET SHIPROCKET DETAILS
    // ==========================================

    const shiprocketExchangeOrderId =
      shiprocketData?.order_id ??
      shiprocketData?.data?.order_id ??
      null;

    const shiprocketExchangeShipmentId =
      shiprocketData?.shipment_id ??
      shiprocketData?.data?.shipment_id ??
      null;

    if (!shiprocketExchangeShipmentId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Shiprocket shipment ID was not generated",
          details:
            shiprocketData,
        },
        { status: 500 }
      );
    }

    // ==========================================
    // 9. SUCCESS
    // ==========================================
// ==========================================
// 9. SAVE EXCHANGE SHIPMENT DETAILS
// ==========================================

const shiprocketExchangeAwbCode =
  shiprocketData?.awb_code ??
  shiprocketData?.data?.awb_code ??
  null;

const shiprocketExchangeCourierName =
  shiprocketData?.courier_name ??
  shiprocketData?.data?.courier_name ??
  null;

const shiprocketExchangeStatus =
  shiprocketData?.status ??
  shiprocketData?.data?.status ??
  "NEW";

const shiprocketExchangeTrackingUrl =
  shiprocketExchangeAwbCode
    ? `https://www.shiprocket.in/shipment-tracking/${shiprocketExchangeAwbCode}`
    : null;

const { error: updateError } =
  await supabaseAdmin
    .from("exchange_requests")
    .update({
      status: "exchange_shipped",

      shiprocket_exchange_order_id:
        shiprocketExchangeOrderId,

      shiprocket_exchange_shipment_id:
        shiprocketExchangeShipmentId,

      shiprocket_exchange_awb_code:
        shiprocketExchangeAwbCode,

      shiprocket_exchange_courier_name:
        shiprocketExchangeCourierName,

      shiprocket_exchange_status:
        shiprocketExchangeStatus,

      shiprocket_exchange_tracking_url:
        shiprocketExchangeTrackingUrl,
    })
    .eq("id", exchange_request_id);

if (updateError) {
  console.error(
    "Exchange shipment details save failed:",
    updateError
  );

  return NextResponse.json(
    {
      success: false,
      error:
        "Exchange shipment was created but details could not be saved",
      details: updateError.message,
    },
    { status: 500 }
  );
}

// ==========================================
// 10. SUCCESS
// ==========================================

return NextResponse.json({
  success: true,

  message:
    "Exchange shipment created successfully",

  data: {
    shiprocket_exchange_order_id:
      shiprocketExchangeOrderId,

    shiprocket_exchange_shipment_id:
      shiprocketExchangeShipmentId,

    shiprocket_exchange_awb_code:
      shiprocketExchangeAwbCode,

    shiprocket_exchange_courier_name:
      shiprocketExchangeCourierName,

    shiprocket_exchange_status:
      shiprocketExchangeStatus,

    shiprocket_exchange_tracking_url:
      shiprocketExchangeTrackingUrl,
  },
});


  } catch (error) {
    console.error(
      "Shiprocket exchange error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error",
      },
      { status: 500 }
    );
  }
}