import { pool } from "@/db";
export async function POST(request) {
  const { email } = await request.json();
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE staff_email = ?",
      [email],
    );
    return Response.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
  }
}
