/* eslint-disable react-hooks/exhaustive-deps */
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { useMutation } from "react-query";
import { useRecoilState, useSetRecoilState } from "recoil";

import { fetchCreatedPDF, fetchGeneratedSummaryText, reGenerateMindmap } from "@/_services";
import { CanvasMode, CustomSession, MindMapDetailsProps } from "@/_types";
import { ChatMessageProps } from "@/_types/ChatMessageProps";
import starsIcon from "@/assets/icons/stars.svg";
import { Button, Textarea } from "@/components/";
import { useDidUpdateEffect } from "@/hooks";
import {
  canvasStateAtom,
  edgesAtomState,
  layerAtomState,
  promptResultState,
  promptValueState,
  qaState,
  streamedAnswersState,
} from "@/state";
import { convertToMermaid, findCollaboratorId, scrollToBottom, uppercaseFirstLetter } from "@/utils";
import { handleStreamGPTData } from "@/utils/handleStreamGPTData";

function PromptTextInput({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps }) {
  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [edges, setEdges] = useRecoilState(edgesAtomState);

  const indexText = useTranslations("Index");
  const chatText = useTranslations("Chat");

  const size = 20;
  const { description, members } = userMindmapDetails;

  const userMemberID = findCollaboratorId(safeSession?.data.session.user.id, members);

  const setCanvasState = useSetRecoilState(canvasStateAtom);
  const [, setPromptValue] = useRecoilState(promptValueState);
  const setPromptResult = useSetRecoilState(promptResultState);
  const [answerMessages, setAnswerMessages] = useRecoilState<ChatMessageProps[]>(streamedAnswersState);
  const setQa = useSetRecoilState(qaState);

  const [text, setText] = useState("");
  const [textareaHeight, setTextareaHeight] = useState("36px");

  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const createdPDF = useMutation(fetchCreatedPDF, {
    onSuccess: () => {
      setText("");
    },
    onError: () => {
      setText("");
    },
  });

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
    if (done || isLoading) {
      setIsLoading(false);
      setPromptResult(false);
      scrollToBottom();
    }
    updateQa();
  }, [done, isLoading, updateQa]);

  const handleTextareaChange = (event: any) => {
    setText(event.target.value);
    event.target.style.height = "36px";
    const newHeight = event.target.scrollHeight;

    setTextareaHeight(newHeight + "px");
  };

  const sendPrompt = ({ prompt }: { prompt?: string }) => {
    setAnswerMessages([{ text: "", sender: "server" }]);
    setIsLoading(true);
    setPromptResult(true);
    setPromptValue(text);

    const mindMapArray = convertToMermaid(layers, edges);

    const fetchStreamData = fetchGeneratedSummaryText({
      session: safeSession,
      conversationId: userMindmapDetails.conversation ? userMindmapDetails.conversation?.id : "",
      mindmapId: userMindmapDetails.id,
      organizationMemberId: userMemberID,
      description,
      task: prompt ?? text,
      data: mindMapArray,
    });

    handleStreamGPTData(fetchStreamData, setAnswerMessages, setDone, setIsLoading);

    const newQA = {
      text: prompt ?? text,
      message: answerMessages[0].text,
    };

    setQa((prevQa) => [...prevQa, newQA]);

    setText("");
  };

  const createPDF = (prompt: any) => {
    setText(prompt);
    const mindMapArray = convertToMermaid(layers, edges);

    const createPDFReqObject = {
      task: prompt,
      mermaid: mindMapArray,
      description,
    };

    createdPDF.mutate({
      session: session,
      pdfReqObject: createPDFReqObject,
    });
  };

  const handleGenerateMindmap = async (e: any) => {
    e.preventDefault();

    const mindmapReqObject = {
      mindmapId: userMindmapDetails.id,
      task: userMindmapDetails.description,
    };

    const response = await reGenerateMindmap({
      session: session,
      mindmapReqObject: mindmapReqObject,
    });

    const reader = response.getReader();

    if (!reader) return;

    let result = "";

    while (true as const) {
      setIsGenerating(true);
      const { done, value } = await reader.read();

      if (done) {
        setIsGenerating(false);
        break;
      }

      // Convert the chunk to text and clean up json markers
      const chunk = new TextDecoder().decode(value);

      result += chunk;

      result = result.replace(/^```json/, "").replace(/```$/, "");

      // Remove the "json" prefix if it exists
      if (result.startsWith("json")) {
        result = result.slice(4);
      }

      try {
        const parsedData = JSON.parse(result);

        if (parsedData.layers && parsedData.edges) {
          setLayers(parsedData.layers);
          setEdges(parsedData.edges);
        }
      } catch (e) {
        // Incomplete JSON, continue collecting chunks
        continue;
      }
    }

    // fetchGeneratedMindmap.mutate({
    //   session: session,
    //   mindmapReqObject: mindmapReqObject,
    // });
  };

  const handleQuickPrompt = (e: any, name: string, prompt: string) => {
    e.preventDefault();
    if (name === "Create PDF") {
      createPDF(prompt);
      return;
    }

    setText(prompt);
    sendPrompt({ prompt });
  };

  const handleSendPrompt = (event: any) => {
    if (text) {
      setCanvasState({
        mode: CanvasMode.Typing,
      });

      if (event.code === "Enter") {
        event.preventDefault();
        sendPrompt({});
      }

      if (event.type === "click") {
        event.preventDefault();
        sendPrompt({});
      }
    }
  };
  const quickPrompts = [
    {
      name: "Summarize",
      prompt: "Make a summary of this mindmap",
    },
    {
      name: "Generate Essay",
      prompt: "Write a persuasive essay on the information within the mindmap.",
    },
    {
      name: "Create Proposal",
      prompt: "Generate a proposal document based on the information within the mindmap.",
    },
    {
      name: "Create Website",
      prompt:
        "Export the mindmap content as a webpage (HTML format). Using tailwind for CSS be creative. And use a lot of colors, grid layouts with variations between columns and rows. Here is your task: 'Create a beautiful modern website with a table about this mindmap. A navigation multiple section with different varations of layouts and good letter spacing And images using pexels our unsplash related to the content of the mindmap. It needs to be appaeling to read'",
    },
    {
      name: "Create List of Key Ideas",
      prompt: "Extract and list key points from the mindmap in a digestible format.",
    },
    {
      name: "Create PDF",
      prompt: "Automatically generate a PDF document of the mindmap.",
    },
  ];

  if (safeSession)
    return (
      <>
        <form
          onSubmit={handleSendPrompt}
          className="relative flex flex-row items-start max-h-36 p-2 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
        >
          <Textarea
            className="resize-none overflow-y-hidden w-[90%] border-0 dark:text-white"
            placeholder={chatText("promptInput")}
            value={text}
            onKeyDown={handleSendPrompt}
            onChange={handleTextareaChange}
            disabled={isLoading || createdPDF.isLoading}
            style={{ height: textareaHeight }}
            required
          />
          <Button className="absolute bottom-2 right-2" size="icon" disabled={isLoading || createdPDF.isLoading}>
            <Image
              className={isLoading || createdPDF.isLoading ? "animate-spin" : ""}
              src={starsIcon}
              height={size}
              width={size}
              alt="Stars icon"
            />
          </Button>
          <aside className="absolute bottom-[56px] flex flex-wrap justify-between w-full left-0">
            {quickPrompts.map((item, index) => (
              <button
                key={index}
                onClick={(e) => handleQuickPrompt(e, item.name, item.prompt)}
                className="border bg-white dark:bg-slate-900 dark:bg-opacity-80 dark:border-slate-800 px-4 py-2 w-fit rounded-full text-xs hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap mb-2"
              >
                {item.name}
              </button>
            ))}
            <Button onClick={handleGenerateMindmap} className="px-4 py-2" disabled={isGenerating}>
              <Sparkles className={isGenerating ? "animate-spin" : ""} height={size - 5} />
              <p className="dark:text-white">{uppercaseFirstLetter(indexText("generate"))}</p>
            </Button>
          </aside>
          {createdPDF.isLoading ||
            (isGenerating && (
              <div className="absolute top-[-196px] left-1/2 -translate-x-1/2 bg-white shadow-lg backdrop-filter backdrop-blur-lg border dark:border dark:bg-slate-900 dark:bg-opacity-95 dark:border-slate-800 p-4 rounded-lg text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto mb-2"></div>
                <p>{isGenerating ? "Mindmap is " + indexText("generating") + "..." : "We are creating your pdf..."}</p>
              </div>
            ))}
        </form>
      </>
    );
}

export { PromptTextInput };
