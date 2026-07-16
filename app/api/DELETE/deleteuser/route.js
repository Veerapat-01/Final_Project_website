import { pool } from "@/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";
const encodedSecret = new TextEncoder().encode(SECRET_KEY);

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, encodedSecret);
    const currentUserEmail = payload.email;

    const { id, email: targetEmail } = await request.json();
    
    if (!id || !targetEmail) {
      return NextResponse.json({ error: "Missing user id or email" }, { status: 400 });
    }

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

    if (targetEmail === currentUserEmail) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    // Delete user
    const [result] = await pool.query(
      "DELETE FROM users WHERE staff_id = ? OR staff_email = ?",
      [id, targetEmail]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
