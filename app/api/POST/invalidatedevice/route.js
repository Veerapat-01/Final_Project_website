import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(request) {
  try {
    const { chassisNumber, ip, username, password, deviceSystemIp } =
      await request.json();

    if (!chassisNumber || !ip || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const authResponse = await axios.post(
      `https://${ip}/j_security_check`,
      `j_username=${username}&j_password=${password}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent,
      },
    );

    const sessionCookie = authResponse.headers["set-cookie"]
      ?.map((c) => c.split(";")[0])
      .join("; ");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    const tokenResponse = await axios.get(
      `https://${ip}/dataservice/client/token`,
      { headers: { Cookie: sessionCookie }, httpsAgent }
    );

    const xsrfToken = tokenResponse.data;

    const invalidateResponse = await axios.delete(
      `https://${ip}/dataservice/certificate/${chassisNumber}?deviceId=${deviceSystemIp}`,
      {
        headers: {
          Cookie: sessionCookie,
          "X-XSRF-TOKEN": xsrfToken,
          "Accept": "application/json",
        },
        httpsAgent,
      },
    );

    let finalData = invalidateResponse.data;

    // Check if vManage returned a task ID (asynchronous operation)
    if (invalidateResponse.data && invalidateResponse.data.id) {
      const taskId = invalidateResponse.data.id;
      let taskStatus = "in_progress";
      
      // Poll the task status up to 30 times (60 seconds)
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        try {
          const statusResponse = await axios.get(
            `https://${ip}/dataservice/device/action/status/${taskId}`,
            {
              headers: { Cookie: sessionCookie },
              httpsAgent,
            }
          );
          
          if (statusResponse.data && statusResponse.data.summary) {
            taskStatus = statusResponse.data.summary.status;
            finalData = statusResponse.data;
            
            if (taskStatus === "done" || taskStatus === "success") {
              break;
            } else if (taskStatus === "failure" || taskStatus === "failed") {
              throw new Error(`vManage task failed: ${JSON.stringify(statusResponse.data)}`);
            }
          }
        } catch (err) {
          // If polling fails or task throws, we propagate the error
          throw err;
        }
      }
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Device invalidated successfully",
        data: finalData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Invalidate device error:", error?.response?.data ?? error.message);
    const detailMsg = error?.response?.data?.error?.message || error?.response?.data || error.message;
    return NextResponse.json(
      { error: `Failed to invalidate device: ${JSON.stringify(detailMsg)}` },
      { status: 500 },
    );
  }
}
