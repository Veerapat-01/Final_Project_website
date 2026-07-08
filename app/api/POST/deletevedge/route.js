import { NextResponse } from "next/server";
import { VManageClient } from "@/lib/VManageClient";

export async function POST(request) {
  try {
    const { uuid, ip, username, password } = await request.json();
    const client = new VManageClient(ip, username, password);

    const data = await client.deleteWanEdge(uuid);

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
