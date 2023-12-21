import React from "react";
import { useRecoilValue } from "recoil";

import { ChatMessageProps } from "@/_types/ChatMessageProps";
import { SkeletonAnswerText } from "@/components/gpt";
import { streamedMessageState } from "@/recoil";

function AnswerMessages() {
  const messages = useRecoilValue<ChatMessageProps[]>(streamedMessageState);

  if (messages[0]?.text == "") return <SkeletonAnswerText />;

  return (
    <>
      {messages.map((message, index) => (
        <p key={index}>{message.text}</p>
      ))}
    </>
  );
}

export { AnswerMessages };
