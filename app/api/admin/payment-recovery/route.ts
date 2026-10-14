import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const ADMIN_EMAIL = "mittaligoyal2602@gmail.com";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (
      authError ||
      !user ||
      user.email?.toLowerCase() !== ADMIN_EMAIL
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("payment_recovery")
      .select(
        "id, razorpay_payment_id, razorpay_order_id, customer_email, customer_name, expected_amount_paise, status, order_number, last_error, attempts, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Payment recovery query failed:", error);

      return NextResponse.json(
        { error: "Could not load recovery records." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      records: data ?? [],
    });
  } catch (error) {
    console.error("Payment recovery API error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}