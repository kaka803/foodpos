import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (username.trim() === validUsername.trim() && password === validPassword) {
      // Create session cookie
      const cookieStore = await cookies();
      const tokenPayload = {
        username: validUsername,
        role: "admin",
        loginTime: Date.now(),
      };

      const tokenString = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

      cookieStore.set("pos_auth_token", tokenString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        user: { username: validUsername, role: "admin" },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
