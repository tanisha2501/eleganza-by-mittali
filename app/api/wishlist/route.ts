import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("wishlists")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Wishlist GET error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Wishlist GET error:", error);

    return NextResponse.json(
      { error: "Failed to load wishlist" },
      { status: 500 }
    );
  }
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
      product_name,
      colour,
      size,
    } = body;

    if (!product_name || !size) {
      return NextResponse.json(
        { error: "Missing wishlist data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("wishlists")
      .insert({
        user_email: user.email,
        product_name,
        colour: colour || "Default",
        size,
      })
      .select()
      .single();

    if (error) {
      console.error("Wishlist POST error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Wishlist POST error:", error);

    return NextResponse.json(
      { error: "Failed to add wishlist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
      product_name,
      colour,
      size,
    } = body;

    if (!product_name || !size) {
      return NextResponse.json(
        { error: "Missing wishlist data" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("user_email", user.email)
      .eq("product_name", product_name)
      .eq("colour", colour || "Default")
      .eq("size", size);

    if (error) {
      console.error("Wishlist DELETE error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);

    return NextResponse.json(
      { error: "Failed to remove wishlist item" },
      { status: 500 }
    );
  }
}