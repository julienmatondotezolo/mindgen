import React from "react";
import { useRecoilValue } from "recoil";

import { ChatMessageProps } from "@/_types/ChatMessageProps";
import { SkeletonAnswerText } from "@/components/gpt";
import { streamedAnswersState } from "@/state";

function AnswerMessages() {
  const messages = useRecoilValue<ChatMessageProps[]>(streamedAnswersState);

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
