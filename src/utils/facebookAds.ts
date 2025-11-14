// src/utils/facebookAds.ts
const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN as string;
const AD_ACCOUNT_ID = process.env.NEXT_PUBLIC_FB_AD_ACCOUNT_ID as string;
const PAGE_ID = process.env.NEXT_PUBLIC_FB_PAGE_ID as string;

interface ApiResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Generic function to call the Facebook Graph API
 */
export async function callFacebookAPI(
  endpoint: string,
params: Record<string, string> = {},
  method: "GET" | "POST" = "GET"
) {
  const baseUrl = `https://graph.facebook.com/${API_VERSION}/${endpoint}`;
  let url = `${baseUrl}?access_token=${ACCESS_TOKEN}`;

  const options: RequestInit = { method };

  if (method === "POST") {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(params);
  } else {
    const query = new URLSearchParams(params).toString();
    if (query) url += `&${query}`;
  }

  // Debug request info without leaking access token
  console.log("[FB API] Request", { version: API_VERSION, endpoint, method, params });

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    console.error("[FB API] Error Response", {
      endpoint,
      status: res.status,
      statusText: res.statusText,
      body: text,
    });
    throw new Error(`Facebook API Error: ${res.statusText} (${text})`);
  }

  const json = (await res.json()) as ApiResponse;
  console.log("[FB API] Response", { endpoint, status: res.status, ok: res.ok, body: json });
  return json;
}

/**
 * Fetch ad accounts linked to the user
 */
export async function getAdAccounts() {
  const url = `/api/facebook/adaccounts?fields=${encodeURIComponent("id,name,account_status,amount_spent,currency")}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get ad accounts failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * Update campaign status (e.g., ACTIVE or PAUSED)
 */
export async function updateCampaignStatus(id: string, status: "ACTIVE" | "PAUSED") {
  const res = await fetch("/api/facebook/campaigns", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update campaign status failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * Update ad set status (e.g., ACTIVE or PAUSED)
 */
export async function updateAdSetStatus(id: string, status: "ACTIVE" | "PAUSED") {
  const res = await fetch("/api/facebook/adsets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update ad set status failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * List ads (entire account)
 */
export async function getAds(fields: string = "id,name,status,adset_id,campaign_id") {
  const url = `/api/facebook/ads?fields=${encodeURIComponent(fields)}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get ads failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * List ads by campaign
 */
export async function getAdsByCampaign(campaignId: string, fields: string = "id,name,status,adset_id,campaign_id") {
  const url = `/api/facebook/ads?campaignId=${encodeURIComponent(campaignId)}&fields=${encodeURIComponent(fields)}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get ads by campaign failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * List ads by ad set
 */
export async function getAdsByAdSet(adsetId: string, fields: string = "id,name,status,adset_id,campaign_id") {
  const url = `/api/facebook/ads?adsetId=${encodeURIComponent(adsetId)}&fields=${encodeURIComponent(fields)}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get ads by ad set failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * Create a new campaign in your ad account
 */
export async function createCampaign(name: string) {
  // Use server-side API route to avoid CORS and keep token secure
  const res = await fetch("/api/facebook/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create campaign failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * List campaigns in the ad account (for selection)
 */
export async function getCampaigns(fields: string = "id,name,status,objective") {
  // Use server-side API route to avoid CORS and keep token secure
  const url = `/api/facebook/campaigns?fields=${encodeURIComponent(fields)}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get campaigns failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * Create a new ad set under a campaign
 */
export async function createAdSet(campaignId: string, name?: string) {
  const res = await fetch("/api/facebook/adsets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, name }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create ad set failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * List ad sets under a campaign (for selection)
 */
export async function getAdSetsByCampaign(campaignId: string, fields: string = "id,name,status,campaign_id") {
  const url = `/api/facebook/adsets?campaignId=${encodeURIComponent(campaignId)}&fields=${encodeURIComponent(fields)}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get ad sets by campaign failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * List ad sets in the ad account (all)
 */
export async function getAdSets(fields: string = "id,name,status,campaign_id") {
  const url = `/api/facebook/adsets?fields=${encodeURIComponent(fields)}&limit=50`
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get ad sets failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * Create an ad creative (linked to your page)
 */
export async function createAdCreative(name: string) {
  const res = await fetch("/api/facebook/adcreatives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pageId: PAGE_ID }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create ad creative failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}

/**
 * Create an ad using an ad set and a creative
 */
export async function createAd(adsetId: string, creativeId: string) {
  const res = await fetch("/api/facebook/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Ad",
      adset_id: adsetId,
      creative: { creative_id: creativeId },
      status: "PAUSED",
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create ad failed: ${res.status} ${text}`)
  }
  return (await res.json()) as ApiResponse
}
