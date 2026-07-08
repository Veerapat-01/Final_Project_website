import { NextResponse } from "next/server";
import { VManageClient } from "@/lib/VManageClient";

export async function POST(request) {
  try {
    const { ip, username, password, deviceId } = await request.json();
    const client = new VManageClient(ip, username, password);

    const response = await client.request('GET', `/dataservice/device/interface?deviceId=${deviceId}`);

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get interfaces",
      },
      {
        status: 500,
      }
    );
  }
}
