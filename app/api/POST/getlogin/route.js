import { pool } from "@/db";

export async function POST(request) {
  try {
    const { email } = await request.json();

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE staff_email = ? ",
      [email],
    );

    return Response.json(rows);
  } catch (error) {
    console.error("Database query error:", error);

    return Response.json({ error: error.message }, { status: 500 });
  }
}
