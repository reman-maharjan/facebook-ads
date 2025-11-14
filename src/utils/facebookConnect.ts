const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN as string;

if (!ACCESS_TOKEN) {
  throw new Error("Missing NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN in .env");
}

export class FacebookGraphAPI {
  private version: string;
  private token: string;

  constructor(version = API_VERSION, token = ACCESS_TOKEN) {
    this.version = version;
    this.token = token;
  }

  /** Build full Graph API URL */
  private buildUrl(endpoint: string, params?: Record<string, any>) {
    const base = `https://graph.facebook.com/${this.version}/${endpoint}`;
    const qs = new URLSearchParams({ access_token: this.token });

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) qs.append(k, String(v));
      });
    }

    return `${base}?${qs.toString()}`;
  }

  /** Generic GET request */
  async get<T = unknown>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);

    console.log("[FB GET]", endpoint, params);

    const res = await fetch(url);

    const json = await res.json();
    if (!res.ok) {
      console.error("[FB ERROR]", json);
      throw new Error(json.error?.message || "Facebook API GET error");
    }

    return json as T;
  }

  /** Generic POST request */
  async post<T = unknown>(endpoint: string, body: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint);

    console.log("[FB POST]", endpoint, body);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("[FB ERROR]", json);
      throw new Error(json.error?.message || "Facebook API POST error");
    }

    return json as T;
  }

  /** Generic DELETE request */
  async delete<T = unknown>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);

    console.log("[FB DELETE]", endpoint, params);

    const res = await fetch(url, { method: "DELETE" });
    const json = await res.json();

    if (!res.ok) {
      console.error("[FB ERROR]", json);
      throw new Error(json.error?.message || "Facebook API DELETE error");
    }

    return json as T;
  }
}

// Export a default instance for easy use
export const fb = new FacebookGraphAPI();
