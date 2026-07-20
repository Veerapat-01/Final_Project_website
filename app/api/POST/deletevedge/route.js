import { NextResponse } from "next/server";
import { VManageClient } from "@/lib/VManageClient";
import { pool } from "@/db";

export async function POST(request) {
  try {
    const { uuid, ip, username, password } = await request.json();
    const client = new VManageClient(ip, username, password);

    const data = await client.deleteWanEdge(uuid);

    // Delete the old device from the local database
    await pool.execute("DELETE FROM device_lists WHERE serial = ?", [uuid]);

    return NextResponse.json(
      {
        success: true,
        message: "Device deleted successfully",
        data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}
