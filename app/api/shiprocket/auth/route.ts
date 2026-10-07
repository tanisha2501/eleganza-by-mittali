import { NextResponse } from "next/server";

export async function POST() {
  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Shiprocket credentials are missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || "Shiprocket authentication failed",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.token,
    });
  } catch (error) {
    console.error("Shiprocket Auth Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to connect to Shiprocket",
      },
      { status: 500 }
    );
  }
}