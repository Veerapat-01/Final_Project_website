import { pool } from "@/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, encodedSecret);
    const email = payload.email;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE staff_email = ? ",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user without the password
    const user = { ...rows[0] };
    delete user.staff_password;

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
