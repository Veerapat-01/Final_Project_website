import { pool } from "@/db";

export async function POST(request) {
  try {
    const { system_ip, hostname, siteid, ipad1, ipad2, reachable } =
      await request.json();

    await pool.execute("INSERT INTO device_lists VALUES (?, ?, ?, ?, ?, ?)", [
      hostname,
      system_ip,
      siteid,
      ipad1,
      ipad2,
      reachable,
    ]);

    return Response.json({
      success: true,
    });
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
