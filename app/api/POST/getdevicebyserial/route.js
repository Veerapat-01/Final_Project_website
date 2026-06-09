import { pool } from "@/db";
export async function POST(request) {
  try {
    const { sn } = await request.json();
    const [rows] = await pool.query(
      `SELECT * FROM device_lists WHERE serial = ?`,
      [sn],
    );
    return Response.json(rows);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
