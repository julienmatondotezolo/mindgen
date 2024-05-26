/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { Edge, Node, useEdges, useNodes } from "reactflow";
import { useRecoilState, useSetRecoilState } from "recoil";

import { fetchGeneratedTSummaryText } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import { ChatMessageProps } from "@/_types/ChatMessageProps";
import starsIcon from "@/assets/icons/stars.svg";
import { Button, Textarea } from "@/components/";
import { useDidUpdateEffect } from "@/hooks";
import { promptResultState, promptValueState, qaState, streamedAnswersState } from "@/state";
import { convertToNestedArray, findCollaboratorId, scrollToBottom } from "@/utils";
import { handleStreamGPTData } from "@/utils/handleStreamGPTData";

function PromptTextInput({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps }) {
  const chatText = useTranslations("Chat");
  const nodes = useNodes();
  const edges = useEdges();

  const size = 20;
  const { description, collaborators, creatorId } = userMindmapDetails;

  const userCollaboratorID = findCollaboratorId(creatorId, collaborators);

  const [, setPromptValue] = useRecoilState(promptValueState);
  const setPromptResult = useSetRecoilState(promptResultState);
  const [answerMessages, setAnswerMessages] = useRecoilState<ChatMessageProps[]>(streamedAnswersState);
  const setQa = useSetRecoilState(qaState);

  const [text, setText] = useState("");
  const [textareaHeight, setTextareaHeight] = useState("36px");

  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useDidUpdateEffect(() => {
    if (done && isLoading) {
      setIsLoading(false);
      setPromptResult(false);
      scrollToBottom();
    }
    updateQa();
  }, [done, isLoading, updateQa]);

  const sendPrompt = (collaboratorId: string | null, nodes: Node[], edges: Edge[]) => {
    setAnswerMessages([{ text: "", sender: "server" }]);
    setIsLoading(true);
    setPromptResult(true);
    setPromptValue(text);

    const mindMapArray = convertToNestedArray(nodes, edges);

    const fetchStreamData = fetchGeneratedTSummaryText(description, text, mindMapArray, collaboratorId);

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
        sendPrompt(userCollaboratorID, nodes, edges);
      }

      if (event.type === "click") {
        sendPrompt(userCollaboratorID, nodes, edges);
      }
    }
  };

  return (
    <div className="relative flex flex-row items-start max-h-36 overflow-y-auto py-2 pr-2 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:border-slate-800 dark:bg-slate-600 dark:bg-opacity-20">
      <Textarea
        className="resize-none overflow-y-hidden w-[90%] border-0 dark:text-white"
        placeholder={chatText("promptInput")}
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
