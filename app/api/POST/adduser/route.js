import { pool } from "@/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

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

    const { name, email, role: newUserRole } = await request.json();
    
    if (!name || !email || !newUserRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE staff_email = ?", [email]);
    if (existing.length > 0) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const nameParts = name.split(" ");
    const fname = nameParts[0] || "";
    const lname = nameParts.slice(1).join(" ") || "";

    // Default password for new users
    const defaultPassword = "password123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Try to guess the role column name based on adminUser
    let roleColumn = "role";
    if (adminUser.roles !== undefined) roleColumn = "roles";
    if (adminUser.staff_role !== undefined) roleColumn = "staff_role";
    if (adminUser["staff dept"] !== undefined) roleColumn = "staff dept";

    await pool.query(
      `INSERT INTO users (staff_fname, staff_lname, staff_email, staff_password, ?? ) VALUES (?, ?, ?, ?, ?)`,
      [roleColumn, fname, lname, email, hashedPassword, newUserRole]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
