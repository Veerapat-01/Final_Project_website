import axios from "axios";
import https from "https";

export class VManageClient {
  constructor(ip, username, password) {
    this.ip = ip;
    this.username = username;
    this.password = password;
    this.sessionCookie = null;
    this.xsrfToken = null;
    this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }

  async authenticate() {
    const authResponse = await axios.post(
      `https://${this.ip}/j_security_check`,
      `j_username=${encodeURIComponent(this.username)}&j_password=${encodeURIComponent(this.password)}`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent: this.httpsAgent,
        validateStatus: () => true,
      }
    );

    const sessionCookie = authResponse.headers["set-cookie"]
      ?.map((c) => c.split(";")[0])
      .join("; ");

    if (!sessionCookie) {
      throw new Error("Authentication failed");
    }

    this.sessionCookie = sessionCookie;

    const tokenResponse = await axios.get(
      `https://${this.ip}/dataservice/client/token`,
      {
        headers: { Cookie: this.sessionCookie },
        httpsAgent: this.httpsAgent,
        validateStatus: () => true,
      }
    );

    if (tokenResponse.status !== 200) {
      throw new Error("Failed to get XSRF token");
    }

    this.xsrfToken = tokenResponse.data;
  }

  async getAuthHeaders() {
    if (!this.sessionCookie || !this.xsrfToken) {
      await this.authenticate();
    }
    return {
      Cookie: this.sessionCookie,
      "X-XSRF-TOKEN": this.xsrfToken,
    };
  }

  async request(method, endpoint, data = null, headers = {}) {
    const authHeaders = await this.getAuthHeaders();
    const config = {
      method,
      url: `https://${this.ip}${endpoint}`,
      headers: { ...authHeaders, "Content-Type": "application/json", Accept: "application/json", ...headers },
      data,
      httpsAgent: this.httpsAgent,
      validateStatus: () => true
    };
    
    return axios(config);
  }

  async setDeviceValidity(uuid, validity) {
    const vedgeListResponse = await this.request('GET', `/dataservice/certificate/vedge/list`);
    
    if (vedgeListResponse.status !== 200) {
      throw new Error("Failed to retrieve vedge list");
    }
    
    const vedgeList = vedgeListResponse.data?.data ?? [];
    const matched = vedgeList.find(
      (d) =>
        d.chasisNumber === uuid ||
        d.uuid === uuid ||
        d.serialNumber === uuid
    );
    
    if (!matched) {
      throw new Error(`Device not found in vedge list for chassis: ${uuid}`);
    }
    
    const savePayload = [
      {
        chasisNumber: matched.chasisNumber,
        serialNumber: matched.serialNumber,
        validity: validity, // "valid" or "invalid"
      },
    ];
    
    const saveResponse = await this.request('POST', `/dataservice/certificate/save/vedge/list`, savePayload);
    if (saveResponse.status !== 200 && saveResponse.status !== 202) {
      throw new Error(`Device validation failed with status ${saveResponse.status}`);
    }
    return saveResponse.data;
  }

  async pushToControllers() {
    const pushResponse = await this.request('POST', `/dataservice/certificate/vedge/list?action=push`, {});
    if (pushResponse.status !== 200 && pushResponse.status !== 202) {
      throw new Error("Push to controllers failed");
    }
    return pushResponse.data;
  }

  async deleteWanEdge(uuid) {
    const deleteResponse = await this.request('DELETE', `/dataservice/system/device/${uuid}`);
    if (deleteResponse.status !== 200 && deleteResponse.status !== 202 && deleteResponse.status !== 204) {
      throw new Error("Device deletion failed");
    }
    return deleteResponse.data;
  }

  async checkTaskStatus(taskId) {
    const response = await this.request('GET', `/dataservice/device/action/status/${taskId}`);
    return response.data?.summary?.status?.toLowerCase();
  }
}
