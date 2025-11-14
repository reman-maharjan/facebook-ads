
export const runtime='nodejs'
import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN
const APP_SECRET = process.env.FACEBOOK_APP_SECRET

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (!VERIFY_TOKEN) {
    return NextResponse.json({ error: 'Missing verify token' }, { status: 500 })
  }

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }

  return NextResponse.json({ error: 'Invalid verification' }, { status: 403 })
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i]
  return out === 0
}

async function verifySignature(req: NextRequest, rawBody: string) {
  const signature = req.headers.get('x-hub-signature-256') || ''
  if (!APP_SECRET || !signature.startsWith('sha256=')) return false
  const crypto = await import('node:crypto')
  const hmac = crypto.createHmac('sha256', APP_SECRET)
  hmac.update(Buffer.from(rawBody, 'utf8'))
  const expected = 'sha256=' + hmac.digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    const valid = await verifySignature(req, raw)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(raw)

    if (!body || !body.object) {
      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Webhook error' }, { status: 500 })
  }
}
