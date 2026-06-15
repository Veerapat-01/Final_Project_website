import { pool } from "@/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`SELECT * FROM device_lists`);
    return Response.json(rows);
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
