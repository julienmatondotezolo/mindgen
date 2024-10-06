"use client";

// import React, { useState } from "react";

// import { fetchGeneratedTSummaryText } from "@/_services/";
// import { ChatMessageProps } from "@/_types/ChatMessageProps";
// import { convertToMermaid } from "@/utils";

// import ChatMessage from "./ChatMessage";

function ChatBoxSection({ mindMapData }: any) {
  mindMapData;
  return <></>;
  // const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  // const [inputValue, setInputValue] = useState("");

  // const handleMessageSend = () => {
  //   if (inputValue.trim() !== "") {
  //     setMessages([...messages, { text: inputValue, sender: "user" }]);
  //     setMessages((prevMessages) => [...prevMessages, { text: "Loading...", sender: "server" }]);

  //     let data = convertToMermaid(mindMapData.nodes, mindMapData.edges);

  //     fetchGeneratedTSummaryText("Brainstorm ideas to find the name for an wedding app", inputValue, data)
  //       .then(async (stream) => {
  //         const reader = stream!.getReader();
  //         let decodedValue = "";

  //         while (true as const) {
  //           const { done, value } = await reader.read();

  //           if (done) {
  //             break;
  //           }

  //           let data = new TextDecoder("utf-8").decode(value).replaceAll("data:", "");

  //           let spacesInData = data.split("\n");

  //           for (var i in spacesInData) {
  //             let splittedData = spacesInData[i];

  //             decodedValue += splittedData ? JSON.parse(splittedData).choices[0].delta.content : "";
  //           }

  //           setMessages((prevMessages) => {
  //             const lastServerMessageIndex = prevMessages.map((msg) => msg.sender).lastIndexOf("server");

  //             const newMessage = {
  //               ...prevMessages[lastServerMessageIndex],
  //               text: decodedValue,
  //               sender: "server",
  //             };

  //             return prevMessages.map((message, index) => (index === lastServerMessageIndex ? newMessage : message));
  //           });
  //         }
  //         setInputValue("");
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //       });

  //     setInputValue("");
  //   }
  // };

  // return (
  //   <div className="flex flex-col h-full w-full bg-white rounded-xl overflow-hidden">
  //     <div className="bg-gray-200 p-4">Chat Header</div>
  //     <div className="flex-1 overflow-y-auto px-4">
  //       <div className="flex flex-col space-y-6 mt-4 pb-4">
  //         {messages.map((message, index) => (
  //           <ChatMessage key={index} message={message} />
  //         ))}
  //       </div>
  //     </div>
  //     <div className="bg-gray-200 p-4">
  //       <div className="flex">
  //         <input
  //           type="text"
  //           placeholder="Type your message..."
  //           className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
  //           value={inputValue}
  //           onChange={(e) => setInputValue(e.target.value)}
  //         />
  //         <button
  //           onClick={handleMessageSend}
  //           className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded focus:outline-none"
  //         >
  //           Send
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default ChatBoxSection;
