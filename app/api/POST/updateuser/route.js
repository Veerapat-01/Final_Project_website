import { pool } from "@/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, encodedSecret);
    const currentUserEmail = payload.email;

    // Verify current user is admin
    const [adminRows] = await pool.query(
      "SELECT * FROM users WHERE staff_email = ?",
      [currentUserEmail]
    );

    if (adminRows.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = adminRows[0];
    const role = (adminUser.role || adminUser.roles || adminUser.staff_role || adminUser["staff dept"] || "").toLowerCase();
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const { email, role: updatedRole } = await request.json();
    
    if (!email || !updatedRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let roleColumn = "role";
    if (adminUser.roles !== undefined) roleColumn = "roles";
    if (adminUser.staff_role !== undefined) roleColumn = "staff_role";
    if (adminUser["staff dept"] !== undefined) roleColumn = "staff dept";

    await pool.query(
      `UPDATE users SET ?? = ? WHERE staff_email = ?`,
      [roleColumn, updatedRole, email]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
