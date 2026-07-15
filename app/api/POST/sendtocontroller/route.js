import { NextResponse } from "next/server";
import { VManageClient } from "@/lib/VManageClient";

export async function POST(request) {
  try {
    const { ip, username, password } = await request.json();
    const client = new VManageClient(ip, username, password);

    const data = await client.pushToControllers();
    const taskId = data.id;

    if (!taskId) {
      throw new Error("No task ID returned from vManage");
    }

    let isCompleted = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = await client.checkTaskStatus(taskId);
      if (status === 'success' || status === 'done') {
        isCompleted = true;
        break;
      }
      
      if (status === 'failed' || status === 'failure') {
        throw new Error("vManage failed to push certificates to controllers.");
      }
    }

    if (!isCompleted) {
      throw new Error("Timeout waiting for controller synchronization.");
    }

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