import { NextRequest } from "next/server"

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0"
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN
const AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID || process.env.NEXT_PUBLIC_FB_AD_ACCOUNT_ID

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { name, adset_id, creative, status } = payload || {}
    if (!adset_id || !creative?.creative_id) {
      return new Response(JSON.stringify({ error: "adset_id and creative.creative_id are required" }), { status: 400 })
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${AD_ACCOUNT_ID}/ads?access_token=${ACCESS_TOKEN}`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Test Ad",
        adset_id,
        creative,
        status: status || "PAUSED",
      }),
      cache: "no-store",
    })

    const body = await res.text()
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500 })
  }
}
