import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { fetchGeneratedTSummaryText } from "@/_services";
import { ChatMessageProps } from "@/_types/ChatMessageProps";
import { useMindMap, useStreamGPT } from "@/hooks";
import { promptResultState, promptValueState } from "@/recoil";
import { handleStreamGPTData } from "@/utils/handleStreamGPTData";

function Messages() {
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);
  const promptValue = useRecoilValue(promptValueState);
  const { mindMapArray } = useMindMap();

  const [done, setDone] = useState(false);
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);

  useEffect(() => {
    if (promptResult && !done) {
      const fetchStreamData = fetchGeneratedTSummaryText(
        "Mindgen application working and purpose",
        promptValue,
        mindMapArray(),
      );

      handleStreamGPTData(fetchStreamData, setMessages, setDone);
    }
  }, [promptResult, done, promptValue, mindMapArray]);

  return (
    <>
      {messages.map((message, index) => (
        <p key={index}>{message.text}</p>
      ))}
    </>
  );
}

export { Messages };
