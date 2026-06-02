import axios from "axios";
import https from "https";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { ip, username, password } = await request.json();

    const formData = new URLSearchParams({
      j_username: username,
      j_password: password,
    });

    const response = await axios.post(
      `https://${ip}/j_security_check`,
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        validateStatus: () => true,
      },
    );

    return NextResponse.json({
      success: true,
      cookie: response.headers["set-cookie"] || [],
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
