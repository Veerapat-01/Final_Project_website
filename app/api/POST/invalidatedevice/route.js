import axios from "axios";

export async function POST(request) {
  try {
    const { chassisNumber, ip, username, password, deviceSystemIp } =
      await request.json();

    if (!chassisNumber || !ip || !username || !password) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const authResponse = await axios.post(
      `https://${ip}:8443/j_security_check`,
      `j_username=${username}&j_password=${password}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent: {
          rejectUnauthorized: false,
        },
        maxRedirects: 5,
        withCredentials: true,
      },
    );

    const cookies = authResponse.headers["set-cookie"];
    const sessionCookie = cookies?.find((c) => c.includes("JSESSIONID"));

    if (!sessionCookie) {
      return Response.json({ error: "Authentication failed" }, { status: 401 });
    }

    const cookie = sessionCookie.split(";")[0];

    const invalidatePayload = {
      uuid: chassisNumber,
    };

    const invalidateResponse = await axios.post(
      `https://${ip}:8443/dataservice/certificate/device/invalidate`,
      invalidatePayload,
      {
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        httpsAgent: {
          rejectUnauthorized: false,
        },
        withCredentials: true,
      },
    );

    return Response.json({
      status: "success",
      message: "Device invalidated successfully",
      data: invalidateResponse.data,
    });
  } catch (error) {
    console.error("Invalidate device error:", error.message);
    return Response.json(
      { error: "Failed to invalidate device", details: error.message },
      { status: 500 },
    );
  }
}
