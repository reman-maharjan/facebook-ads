import { NextRequest } from "next/server"

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0"
const DEFAULT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN
const DEFAULT_AD_ACCOUNT_ID = process.env.NEXT_PUBLIC_FB_AD_ACCOUNT_ID
const DEFAULT_PAGE_ID = process.env.NEXT_PUBLIC_FB_PAGE_ID

export async function POST(req: NextRequest) {
  try {
    const userToken = req.cookies.get('fb_user_token')?.value
    const ACCESS_TOKEN = userToken || DEFAULT_ACCESS_TOKEN
    const AD_ACCOUNT_ID = DEFAULT_AD_ACCOUNT_ID
    const PAGE_ID = DEFAULT_PAGE_ID

    const payload = await req.json()
    const { name, pageId, link, message } = payload || {}

    const url = `https://graph.facebook.com/${API_VERSION}/${AD_ACCOUNT_ID}/adcreatives?access_token=${ACCESS_TOKEN}`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Creative",
        object_story_spec: {
          page_id: pageId || PAGE_ID,
          link_data: {
            link: link || "https://example.com",
            message: message || "Check out our example!",
          },
        },
      }),
      cache: "no-store",
    })

    const body = await res.text()
    return new Response(body, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500 })
  }
}
