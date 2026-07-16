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
    console.error("VManage Auth Error:", error);
    
    if (error.message.includes("SSRF Blocked")) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Invalid IP Address" },
        { status: 403 }
      );
    }
    
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
