import { NextRequest } from "next/server"

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0"
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN
const AD_ACCOUNT_ID = process.env.FB_AD_ACCOUNT_ID || process.env.NEXT_PUBLIC_FB_AD_ACCOUNT_ID

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fields = searchParams.get("fields") || "id,name,status,campaign_id"
    const limit = searchParams.get("limit") || "50"
    const campaignId = searchParams.get("campaignId")

    const endpoint = campaignId ? `${campaignId}/adsets` : `${AD_ACCOUNT_ID}/adsets`
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
    const payload = await req.json()
    const { campaignId, name, daily_budget, bid_amount, start_time, end_time, targeting } = payload || {}
    if (!campaignId) {
      return new Response(JSON.stringify({ error: "campaignId is required" }), { status: 400 })
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${AD_ACCOUNT_ID}/adsets?access_token=${ACCESS_TOKEN}`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Test Ad Set",
        optimization_goal: "REACH",
        billing_event: "IMPRESSIONS",
        bid_amount: String(bid_amount ?? 100),
        daily_budget: String(daily_budget ?? 1000),
        campaign_id: campaignId,
        targeting: targeting || JSON.stringify({ geo_locations: { countries: ["US"] } }),
        start_time: start_time || new Date().toISOString(),
        end_time: end_time || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
