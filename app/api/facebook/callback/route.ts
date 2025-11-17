import { NextRequest, NextResponse } from 'next/server'

const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || 'v24.0'
const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FB_APP_ID
const APP_SECRET = process.env.FACEBOOK_APP_SECRET

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }
    if (!APP_ID || !APP_SECRET) {
      return NextResponse.json({ error: 'Missing Facebook app credentials' }, { status: 500 })
    }

    // Must match the one used when initiating OAuth
    const origin = process.env.NEXT_PUBLIC_REDIRECT_URI
    const redirectUri = `${origin}/api/facebook/callback`

    const tokenUrl = new URL(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`)
    tokenUrl.searchParams.set('client_id', String(APP_ID))
    tokenUrl.searchParams.set('client_secret', String(APP_SECRET))
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)

    const res = await fetch(tokenUrl.toString(), { method: 'GET', cache: 'no-store' })
    const json = await res.json() 

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('[FB OAuth] token exchange error', json)
      return NextResponse.json(json, { status: res.status })
    }

    const accessToken = json.access_token as string | undefined
    const expiresIn = Number(json.expires_in || 0)

    if (!accessToken) {
      return NextResponse.json({ error: 'No access_token in response' }, { status: 500 })
    }

    // Set HttpOnly cookie with user access token
    const response = NextResponse.redirect(`${origin}/facebookads?connected=1`)
    console.log(response.cookies)
    console.log('accessToken:', accessToken)
    response.cookies.set('fb_user_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn || 60 * 60 * 2, 
    })

    return response
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'OAuth callback error' }, { status: 500 })
  }
}
