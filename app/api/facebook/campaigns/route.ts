import { NextRequest } from "next/server"

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0"
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN
const AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID || process.env.NEXT_PUBLIC_FB_AD_ACCOUNT_ID

if (!ACCESS_TOKEN) {
  // eslint-disable-next-line no-console
  console.warn("[API] FACEBOOK_ACCESS_TOKEN is not set. Using NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN if present (not recommended).")
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fields = searchParams.get("fields") || "id,name,status,objective"
    const limit = searchParams.get("limit") || "50"

    const url = new URL(`https://graph.facebook.com/${API_VERSION}/${AD_ACCOUNT_ID}/campaigns`)
    url.searchParams.set("access_token", ACCESS_TOKEN as string)
    url.searchParams.set("fields", fields)
    url.searchParams.set("limit", limit)

    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" })
    const body = await res.text()
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { name } = payload || {}
    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), { status: 400 })
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${AD_ACCOUNT_ID}/campaigns?access_token=${ACCESS_TOKEN}`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        objective: "OUTCOME_TRAFFIC",
        status: "PAUSED",
        special_ad_categories: "NONE",
        is_adset_budget_sharing_enabled: false,
      }),
      cache: "no-store",
    })

    const body = await res.text()
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json()
    const { id, status } = payload || {}
    if (!id || !status) {
      return new Response(JSON.stringify({ error: "id and status are required" }), { status: 400 })
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${id}?access_token=${ACCESS_TOKEN}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      cache: "no-store",
    })
    const body = await res.text()
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500 })
  }
}
