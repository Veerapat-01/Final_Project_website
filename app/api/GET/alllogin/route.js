import { pool } from "@/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

    const [rows] = await pool.query("SELECT * FROM users");
    
    // Clean sensitive data before returning
    const safeRows = rows.map(user => {
      const { staff_password, ...safeUser } = user;
      return safeUser;
    });

    return NextResponse.json(safeRows);
  } catch (error) {
    console.error("GET alllogin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
