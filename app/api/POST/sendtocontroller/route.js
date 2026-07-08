import { NextResponse } from "next/server";
import { VManageClient } from "@/lib/VManageClient";

export async function POST(request) {
  try {
    const { ip, username, password } = await request.json();
    const client = new VManageClient(ip, username, password);

    const data = await client.pushToControllers();

    return NextResponse.json(
      {
        success: true,
        message: "Pushed changes to controllers successfully",
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
      { status: 500 }
    );
  }
}