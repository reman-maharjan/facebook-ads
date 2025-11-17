import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { psid, message } = await req.json();

  if (!psid || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const backendURL = process.env.NEXT_PUBLIC_REDIRECT_URI + "/api/facebook/sendMessage";

  const result = await fetch(backendURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ psid, message }),
  });

  const data = await result.json();
  return NextResponse.json(data);
}
