import { NextRequest } from "next/server"

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0"
const DEFAULT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN
const DEFAULT_AD_ACCOUNT_ID = process.env.NEXT_PUBLIC_FB_AD_ACCOUNT_ID

export async function GET(req: NextRequest) {
  try {
    const userToken = req.cookies.get('fb_user_token')?.value
    const ACCESS_TOKEN = userToken || DEFAULT_ACCESS_TOKEN
    const AD_ACCOUNT_ID = DEFAULT_AD_ACCOUNT_ID

    const { searchParams } = new URL(req.url)
    const fields = searchParams.get("fields") || "id,name,status,adset_id,campaign_id"
    const limit = searchParams.get("limit") || "50"
    const campaignId = searchParams.get("campaignId")
    const adsetId = searchParams.get("adsetId")

    let endpoint = `${AD_ACCOUNT_ID}/ads`
    if (campaignId) endpoint = `${campaignId}/ads`
    if (adsetId) endpoint = `${adsetId}/ads`

    const url = new URL(`https://graph.facebook.com/${API_VERSION}/${endpoint}`)
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
    const userToken = req.cookies.get('fb_user_token')?.value
    const ACCESS_TOKEN = userToken || DEFAULT_ACCESS_TOKEN
    const AD_ACCOUNT_ID = DEFAULT_AD_ACCOUNT_ID
    
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
