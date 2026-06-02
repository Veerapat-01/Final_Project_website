import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { ip, cookie } = await request.json();

    const response = await axios.get(`https://${ip}/dataservice/device`, {
      headers: {
        Cookie: Array.isArray(cookie) ? cookie.join("; ") : cookie,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    return NextResponse.json(
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
