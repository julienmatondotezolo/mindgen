import React, { useState } from "react";

import { fetchGeneratedTSummaryText } from "@/_services/";
import { ChatMessageProps } from "@/_types/ChatMessageProps";

import ChatMessage from "./ChatMessage";

function ChatBoxSection() {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleMessageSend = () => {
    if (inputValue.trim() !== "") {
      setMessages([...messages, { text: inputValue, sender: "user" }]);

      fetchGeneratedTSummaryText(inputValue)
        .then(async (stream) => {
          const reader = stream.getReader();

          while (true as const) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }
            const decodedValue = new TextDecoder("utf-8").decode(value);

            setMessages((prevMessages) => [...prevMessages, { text: decodedValue, sender: "server" }]);
          }
          setInputValue("");
        })
        .catch((error) => {
          console.error(error);
        });

      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl overflow-hidden">
      <div className="bg-gray-200 p-4">Chat Header</div>
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex flex-col space-y-2 mt-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>
      </div>
      <div className="bg-gray-200 p-4">
        <div className="flex">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            onClick={handleMessageSend}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBoxSection;
