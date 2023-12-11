import React from "react";

import { ChatMessageProps } from "@/_types/ChatMessageProps";

function ChatMessage({ message }: { message: ChatMessageProps }) {
  const sender = message.sender === "user" ? "You" : "MindGen Assistant";
  const bgColor = message.sender === "user" ? "bg-gray-300" : "bg-blue-500 text-white";
  const messagePosition = message.sender === "user" ? "items-end justify-end" : "items-start";

  return (
    <div className={`flex row flex-wrap ${messagePosition}`}>
      <p className={`flex w-full text-sm mb-1 ${messagePosition}`}>{sender}</p>
      <div className={`rounded-xl ${bgColor} p-3 max-w-xs`}>{message.text}</div>
    </div>
  );
}

export default ChatMessage;
