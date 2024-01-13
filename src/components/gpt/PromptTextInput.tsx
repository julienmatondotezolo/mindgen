import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { fetchGeneratedTSummaryText } from "@/_services";
import { ChatMessageProps } from "@/_types/ChatMessageProps";
import starsIcon from "@/assets/icons/stars.svg";
import { Button, Textarea } from "@/components/";
import { useMindMap } from "@/hooks";
import { promptResultState, promptValueState, qaState, streamedAnswersState } from "@/recoil";
import { scrollToBottom } from "@/utils";
import { handleStreamGPTData } from "@/utils/handleStreamGPTData";

function PromptTextInput({ collaboratorId }: { collaboratorId: string | null }) {
  const size = 20;

  const [promptValue, setPromptValue] = useRecoilState(promptValueState);
  const setPromptResult = useSetRecoilState(promptResultState);
  const [answerMessages, setAnswerMessages] = useRecoilState<ChatMessageProps[]>(streamedAnswersState);
  const setQa = useSetRecoilState(qaState);

  const [text, setText] = useState("");
  const [textareaHeight, setTextareaHeight] = useState("36px");

  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mindMapArray } = useMindMap();

  const updateQa = useCallback(() => {
    setQa((prevQa) => {
      const updatedQa = [...prevQa];
      const lastIndex = updatedQa.length - 1;

      if (lastIndex >= 0) {
        updatedQa[lastIndex] = {
          ...updatedQa[lastIndex],
          message: answerMessages[0]?.text || "",
        };
      }
      return updatedQa;
    });
  }, [answerMessages]);

  useEffect(() => {
    if (done && isLoading) {
      setIsLoading(false);
      scrollToBottom();
    }

    updateQa();
  }, [done, updateQa]);

  const sendPrompt = (collaboratorId: string | null) => {
    setAnswerMessages([{ text: "", sender: "server" }]);
    setIsLoading(true);
    setPromptResult(true);
    setPromptValue(text);

    const fetchStreamData = fetchGeneratedTSummaryText(
      "A very short explanation in bullet points",
      text,
      mindMapArray(),
      collaboratorId,
    );

    handleStreamGPTData(fetchStreamData, setAnswerMessages, setDone);

    const newQA = {
      text: text,
      message: answerMessages[0].text,
    };

    setQa((prevQa) => [...prevQa, newQA]);

    setText("");
  };

  const handleTextareaChange = (event: any) => {
    setText(event.target.value);
    event.target.style.height = "36px";
    const newHeight = event.target.scrollHeight;

    setTextareaHeight(newHeight + "px");
  };

  const handleSendPrompt = (event: any) => {
    if (text) {
      if (event.code === "Enter") {
        event.preventDefault();
        sendPrompt(collaboratorId);
      }

      if (event.type === "click") {
        sendPrompt(collaboratorId);
      }
    }
  };

  return (
    <div className="relative flex flex-row items-start max-h-36 overflow-y-auto py-2 pr-2 bg-white rounded-xl shadow-lg">
      <Textarea
        className="resize-none overflow-y-hidden w-[90%]"
        placeholder="Ask our generate anything related to this mind map..."
        value={text}
        onKeyDown={handleSendPrompt}
        onChange={handleTextareaChange}
        disabled={isLoading}
        style={{ height: textareaHeight }}
      />
      <Button onClick={handleSendPrompt} className="absolute bottom-2 right-2" size="icon" disabled={isLoading}>
        <Image
          className={isLoading ? "animate-spin" : ""}
          src={starsIcon}
          height={size}
          width={size}
          alt="Stars icon"
        />
      </Button>
    </div>
  );
}

export { PromptTextInput };
