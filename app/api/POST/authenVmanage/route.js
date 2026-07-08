import { NextResponse } from "next/server";
import { VManageClient } from "@/lib/VManageClient";

export async function POST(request) {
  try {
    const { ip, username, password } = await request.json();
    const client = new VManageClient(ip, username, password);
    
    await client.authenticate();

    return NextResponse.json({
      success: true,
      cookie: [client.sessionCookie],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
