"use client";

import ChatInput from "@/src/components/chatInput/page";
import { useState } from "react";

export default function MessengerPage() {
  const [messages, setMessages] = useState<any>([]);
  const USER_PSID = "THE_SELECTED_USER_PSID";

  const sendToBackend = async (text: string) => {
    setMessages((prev: any) => [...prev, { author: "you", text }]);

    await fetch("/api/facebook/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        psid: USER_PSID,
        message: text,
      }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((m: any, i: any) => (
          <div key={i} className={`p-2 rounded ${m.author === "you" ? "bg-blue-100" : "bg-gray-100"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <ChatInput onSend={sendToBackend} />
    </div>
  );
}
