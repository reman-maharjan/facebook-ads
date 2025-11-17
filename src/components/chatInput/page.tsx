"use client";
import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <div className="flex gap-2 p-3 border-t">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 border rounded"
        placeholder="Type /confirm 12345 ..."
      />
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
