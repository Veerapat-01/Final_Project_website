import { pool } from "@/db";

export async function POST(request) {
  try {
    const { email, role } = await request.json();

    const [result] = await pool.query(
      "UPDATE users SET roles = ?, staff_dept = ? WHERE staff_email = ?",
      [role, role, email]
    );

    return Response.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error("Database query error (updateuser):", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
