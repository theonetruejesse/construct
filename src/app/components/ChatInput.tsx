"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ChatInputProps {
  username: string;
}

export function ChatInput({ username }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const sendMessage = useMutation(api.messages.send);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage({ text: message, author: username });
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
      >
        Send
      </button>
    </form>
  );
}
