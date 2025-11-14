import { NextRequest } from "next/server"

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0"
const DEFAULT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN

export async function GET(req: NextRequest) {
  try {
    const userToken = req.cookies.get('fb_user_token')?.value
    const ACCESS_TOKEN = userToken || DEFAULT_ACCESS_TOKEN

    const { searchParams } = new URL(req.url)
    const fields = searchParams.get("fields") || "id,name,account_status,amount_spent"
    const limit = searchParams.get("limit") || "50"

    const url = new URL(`https://graph.facebook.com/${API_VERSION}/me/adaccounts`)
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
