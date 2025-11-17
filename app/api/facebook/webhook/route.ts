export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const API_VERSION = process.env.NEXT_PUBLIC_FB_API_VERSION || "v24.0";
const PAGE_ACCESS_TOKEN = process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const WIT_API_KEY = process.env.NEXT_PUBLIC_WIT_API_KEY;

/* -------------------------------------------------------------------------- */
/*                               HELPER FUNCTIONS                             */
/* -------------------------------------------------------------------------- */

function generateOrderId(): string {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/* -------------------------------------------------------------------------- */
/*                               WIT.AI INTEGRATION                           */
/* -------------------------------------------------------------------------- */

interface WitEntity {
  id: string;
  name: string;
  role: string;
  start: number;
  end: number;
  body: string;
  confidence: number;
  value: string;
}

interface WitResponse {
  text: string;
  intents: Array<{ id: string; name: string; confidence: number }>;
  entities: Record<string, WitEntity[]>;
  traits: Record<string, any>;
}

interface ExtractedOrderData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  orderId?: string;
}

async function extractDataWithWit(messageText: string): Promise<ExtractedOrderData> {
  if (!WIT_API_KEY) {
    console.error("[Wit.ai] Missing WIT_API_KEY");
    return {};
  }

  try {
    const url = `https://api.wit.ai/message?v=20241117&q=${encodeURIComponent(messageText)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${WIT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[Wit.ai] API Error:", response.status, await response.text());
      return {};
    }

    const data: WitResponse = await response.json();
    console.log("[Wit.ai] Response:", JSON.stringify(data, null, 2));

    const extractedData: ExtractedOrderData = {};

    // Extract name
    if (data.entities["wit$contact:contact"]) {
      extractedData.name = data.entities["wit$contact:contact"][0]?.value;
    } else if (data.entities["person_name:person_name"]) {
      extractedData.name = data.entities["person_name:person_name"][0]?.value;
    }

    // Extract email
    if (data.entities["wit$email:email"]) {
      extractedData.email = data.entities["wit$email:email"][0]?.value;
    } else if (data.entities["email:email"]) {
      extractedData.email = data.entities["email:email"][0]?.value;
    }

    // Extract phone
    if (data.entities["wit$phone_number:phone_number"]) {
      extractedData.phone = data.entities["wit$phone_number:phone_number"][0]?.value.replace(/\D/g, "");
    } else if (data.entities["phone:phone"]) {
      extractedData.phone = data.entities["phone:phone"][0]?.value.replace(/\D/g, "");
    }

    // Extract address
    if (data.entities["wit$location:location"]) {
      extractedData.address = data.entities["wit$location:location"][0]?.value?.trim();
    } else if (data.entities["address:address"]) {
      extractedData.address = data.entities["address:address"][0]?.body?.trim();
    }

    console.log("[Wit.ai] Extracted data:", extractedData);
    return extractedData;

  } catch (error) {
    console.error("[Wit.ai] Error:", error);
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/*                          SAVE ORDER DATA TO DATABASE                       */
/* -------------------------------------------------------------------------- */

async function saveOrderData(senderId: string, orderData: ExtractedOrderData, orderId?: string) {
  console.log("[DB] Saving order data for user:", senderId, orderData);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: senderId,
        orderId: orderId || generateOrderId(),
        ...orderData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("[DB] Failed to save order data:", await response.text());
      return null;
    }

    const result = await response.json();
    return result.orderId;
  } catch (error) {
    console.error("[DB] Error saving order data:", error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               VERIFY GET CALL                              */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (!VERIFY_TOKEN)
    return NextResponse.json({ error: "Missing verify token" }, { status: 500 });

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Invalid verification" }, { status: 403 });
}

/* -------------------------------------------------------------------------- */
/*                          SIGNATURE VALIDATION                               */
/* -------------------------------------------------------------------------- */

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

async function verifySignature(req: NextRequest, rawBody: string) {
  const signature = req.headers.get("x-hub-signature-256") || "";
  if (!APP_SECRET || !signature.startsWith("sha256=")) return false;

  const crypto = await import("node:crypto");
  const hmac = crypto.createHmac("sha256", APP_SECRET);
  hmac.update(Buffer.from(rawBody, "utf8"));
  const expected = "sha256=" + hmac.digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                         FACEBOOK SEND MESSAGE API                          */
/* -------------------------------------------------------------------------- */

async function sendMessage(psid: string, text: string) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error("[Webhook] Missing PAGE_ACCESS_TOKEN");
    return;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = { recipient: { id: psid }, message: { text } };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.text();
  console.log("[Send API] Response:", res.status, data);
}

/* -------------------------------------------------------------------------- */
/*                    DETECT IF MESSAGE IS FROM PAGE                          */
/* -------------------------------------------------------------------------- */

function isMessageFromPage(event: any): boolean {
  return event.message?.is_echo === true;
}

/* -------------------------------------------------------------------------- */
/*                        HANDLE MESSAGES FROM USERS                          */
/* -------------------------------------------------------------------------- */

// Send a confirmation message with quick reply buttons
async function sendConfirmationMessage(psid: string, orderId: string) {
  const url = `https://graph.facebook.com/v24.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: psid },
      messaging_type: 'RESPONSE',
      message: {
        text: `Your order ${orderId} is ready! Please confirm or cancel:`,
        quick_replies: [
          {
            content_type: 'text',
            title: '✅ Confirm Order',
            payload: `CONFIRM_ORDER_${orderId}`
          },
          {
            content_type: 'text',
            title: '❌ Cancel Order',
            payload: 'CANCEL_ORDER'
          }
        ]
      }
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error('Error sending confirmation:', data.error);
  }
  return data;
}

async function handleUserMessage(senderId: string, messageText: string) {
  console.log("[User Message] Received:", senderId, messageText);

  try {
    // Check for /confirm command from business page
    if (messageText.trim().toLowerCase().startsWith('/confirm')) {
      const orderId = generateOrderId();
      await saveOrderData(senderId, { status: 'pending' }, orderId);
      await sendConfirmationMessage(senderId, orderId);
      return;
    }

    // Handle confirmation responses
    if (messageText === '✅ Confirm Order') {
      await sendMessage(senderId, "Thank you for confirming! Your order is being processed.");
      await saveOrderData(senderId, { status: 'confirmed' });
      return;
    }

    if (messageText === '❌ Cancel Order') {
      await sendMessage(senderId, "Your order has been cancelled. Let us know if you need anything else!");
      await saveOrderData(senderId, { status: 'cancelled' });
      return;
    }

    // Extract data using Wit.ai
    const extractedData = await extractDataWithWit(messageText);
    const orderInfo: any = { ...extractedData };

    // Save extracted data
    if (Object.keys(extractedData).length > 0) {
      await saveOrderData(senderId, orderInfo);
    }

    // Check if we have all required information
    const hasAllInfo = extractedData.name && 
                      extractedData.email && 
                      extractedData.phone && 
                      extractedData.address;

    if (hasAllInfo) {
      await sendMessage(senderId, "Thank you for your information! Your order details have been saved.");
    } else {
      // Ask for missing information
      await sendMessage(
        senderId,
        "I'd love to help with your order! Could you please share your details?\n\n" +
        "I need:\n• Your name\n• Email address\n• Phone number\n• Delivery address\n\n" +
        "Feel free to tell me in your own words - no special format needed! ✨"
      );
    }
  } catch (error) {
    console.error('Error handling user message:', error);
  }
}

/* -------------------------------------------------------------------------- */
/*                          MAIN WEBHOOK HANDLER                               */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureOK = await verifySignature(req, rawBody);

    if (!signatureOK) {
      console.warn("[Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    if (body.object !== "page") return NextResponse.json({ received: true });

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;

        if (event.message?.text) {
          const messageText = event.message.text;

          if (isMessageFromPage(event)) {
            // Handle page message echo if needed
          } else {
            await handleUserMessage(senderId, messageText);
          }
        }

        if (event.postback?.payload) {
          // handlePostback(senderId, event.postback.payload)
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}