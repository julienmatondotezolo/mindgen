import React from "react";

import { ChatMessageProps } from "@/_types/ChatMessageProps";

function ChatMessage({ message }: { message: ChatMessageProps }) {
  const senderClass = message.sender === "user" ? "bg-gray-300" : "bg-blue-500 text-white";

  return (
    <div className={`flex ${message.sender === "user" ? "items-end justify-end" : "items-start"}`}>
      <div className={`rounded-lg ${senderClass} p-2 max-w-xs`}>{message.text}</div>
    </div>
  );
}

export default ChatMessage;
