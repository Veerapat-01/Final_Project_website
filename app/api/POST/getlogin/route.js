import { pool } from "@/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE staff_email = ? ",
      [email],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];
    
    // Check password (bcrypt or fallback to plaintext for legacy)
    let isValid = false;
    if (user.staff_password.startsWith("$2a$") || user.staff_password.startsWith("$2b$") || user.staff_password.startsWith("$2y$")) {
        isValid = await bcrypt.compare(password, user.staff_password);
    } else {
        isValid = password === user.staff_password;
    }

    if (!isValid) {
       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT
    const token = await new SignJWT({ email: user.staff_email, id: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(encodedSecret);

    // Set HTTP-Only cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60 // 8 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
