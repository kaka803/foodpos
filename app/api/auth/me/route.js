import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pos_auth_token");

    if (!token || !token.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const decoded = JSON.parse(Buffer.from(token.value, "base64").toString("utf-8"));
      if (decoded && decoded.username) {
        return NextResponse.json({
          authenticated: true,
          user: { username: decoded.username, role: decoded.role || "admin" },
        });
      }
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
