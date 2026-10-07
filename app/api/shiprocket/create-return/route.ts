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

    // ----------------------------------------
    // 1. Get original order
    // ----------------------------------------

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

    const pickupAddress =
      originalOrder.address;

    const pickupArea =
      originalOrder.area;

    const pickupCity =
      originalOrder.city;

    const pickupPincode =
      originalOrder.pincode;

    const pickupState =
      originalOrder.state;

    const pickupCountry = "India";

    // ----------------------------------------
    // 2. Validate pickup address
    // ----------------------------------------

    if (
      !pickupAddress ||
      !pickupCity ||
      !pickupPincode ||
      !pickupState
    ) {
      console.error(
        "Pickup details missing:",
        {
          pickupAddress,
          pickupArea,
          pickupCity,
          pickupPincode,
          pickupState,
          pickupCountry,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Pickup address is missing from the original order.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // 3. Shiprocket authentication
    // ----------------------------------------

    const authResponse = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email:
            process.env.SHIPROCKET_EMAIL,

          password:
            process.env.SHIPROCKET_PASSWORD,
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

    // ----------------------------------------
    // 4. Prepare return order
    // ----------------------------------------

    const returnOrderId =
      `EX-${order_number}-${exchange_request_id}`;

    const returnItems =
      exchange_items.map(
        (item: {
          product_name: string;
          old_size: string;
          new_size: string;
          quantity: number;
        }) => ({
          name:
            item.product_name,

          sku:
            item.product_name
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

    // ----------------------------------------
    // 5. Create Shiprocket return order
    // ----------------------------------------

    const returnResponse =
      await fetch(
        "https://apiv2.shiprocket.in/v1/external/orders/create/return",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${authData.token}`,
          },

body: JSON.stringify({
  order_id: returnOrderId,

  order_date: new Date().toISOString(),

  // CUSTOMER = PICKUP LOCATION
  pickup_customer_name: customer_name,
  pickup_last_name: "",

  pickup_address: pickupAddress,
  pickup_address_2: pickupArea || "",

  pickup_city: pickupCity,
  pickup_pincode: String(pickupPincode),
  pickup_state: pickupState,
  pickup_country: pickupCountry,

  pickup_email: customer_email || "",
  pickup_phone: String(customer_mobile),

  // YOUR BUSINESS / WAREHOUSE = DESTINATION
  shipping_customer_name: "Eleganza by Mittali",
  shipping_last_name: "",

  shipping_address: process.env.SHIPROCKET_PICKUP_ADDRESS!,
  shipping_address_2: "",

  shipping_city: process.env.SHIPROCKET_PICKUP_CITY!,
  shipping_pincode:
    process.env.SHIPROCKET_PICKUP_PINCODE!,
  shipping_state:
    process.env.SHIPROCKET_PICKUP_STATE!,
  shipping_country: "India",

  shipping_email:
    process.env.SHIPROCKET_PICKUP_EMAIL || "",

  shipping_phone:
    process.env.SHIPROCKET_PICKUP_PHONE!,

  order_items: returnItems,

  payment_method: "Prepaid",

  sub_total: 0,

  length: 20,
  breadth: 15,
  height: 10,
  weight: 0.5,
}),
        }
      );

    const returnData =
      await returnResponse.json();

    console.log(
      "Shiprocket return response:",
      returnData
    );

    // ----------------------------------------
    // 6. Handle Shiprocket error
    // ----------------------------------------

    if (!returnResponse.ok) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Shiprocket return order creation failed",

          details:
            returnData,
        },
        {
          status:
            returnResponse.status,
        }
      );
    }

    // ----------------------------------------
    // 7. Extract Shiprocket details
    // ----------------------------------------

    const shiprocketReturnOrderId =
      returnData?.order_id ??
      returnData?.data?.order_id ??
      null;

    const shiprocketReturnShipmentId =
      returnData?.shipment_id ??
      returnData?.data?.shipment_id ??
      null;

    const shiprocketReturnAwbCode =
      returnData?.awb_code ??
      returnData?.data?.awb_code ??
      null;

    const shiprocketReturnCourierName =
      returnData?.courier_name ??
      returnData?.data?.courier_name ??
      null;

        const shiprocketReturnStatus =
        returnData?.status ??
        returnData?.data?.status ??
        "RETURN CREATED";

    const shiprocketReturnTrackingUrl =
      shiprocketReturnAwbCode
        ? `https://www.shiprocket.in/shipment-tracking/${shiprocketReturnAwbCode}`
        : null;

    // ----------------------------------------
    // 8. Save exchange request details
    // ----------------------------------------

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("exchange_requests")
      .update({
        status:
          "pickup_requested",

        shiprocket_return_order_id:
          shiprocketReturnOrderId,

        shiprocket_return_shipment_id:
          shiprocketReturnShipmentId,

        shiprocket_return_awb_code:
          shiprocketReturnAwbCode,

        shiprocket_return_courier_name:
          shiprocketReturnCourierName,

        shiprocket_return_status:
          shiprocketReturnStatus,

        shiprocket_return_tracking_url:
          shiprocketReturnTrackingUrl,
      })
      .eq(
        "id",
        exchange_request_id
      );

    if (updateError) {
      console.error(
        "Exchange Shiprocket details save failed:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,

          error:
            "Return was created but exchange details could not be saved",

          details:
            updateError.message,
        },
        { status: 500 }
      );
    }

    // ----------------------------------------
    // 9. Success
    // ----------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Exchange pickup request created successfully",

      data: {
        shiprocket_return_order_id:
          shiprocketReturnOrderId,

        shiprocket_return_shipment_id:
          shiprocketReturnShipmentId,

        shiprocket_return_awb_code:
          shiprocketReturnAwbCode,

        shiprocket_return_courier_name:
          shiprocketReturnCourierName,

        shiprocket_return_status:
          shiprocketReturnStatus,

        shiprocket_return_tracking_url:
          shiprocketReturnTrackingUrl,
      },
    });
  } catch (error) {
    console.error(
      "Shiprocket return error:",
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