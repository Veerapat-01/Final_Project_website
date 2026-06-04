import { pool } from "@/db";
export async function POST(request) {
  try {
    const { hostname } = await request.json();
    const [rows] = await pool.query(
      `SELECT * FROM device_lists WHERE hostname = ?`,
      [hostname],
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
