/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
  const username = safeSession?.data.session.user?.username;

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

    // Reset height before calculating new height
    event.target.style.height = "36px";
    const newHeight = Math.max(36, event.target.scrollHeight);

    setTextareaHeight(`${newHeight}px`);
  };

  const sendPrompt = ({ event, prompt }: { event: any; prompt?: string }) => {
    event.preventDefault();

    console.log("event:", event);
    console.log("prompt:", prompt);

    if (text) {
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
    }
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

    try {
      setIsGenerating(true);

      const mindmapReqObject = {
        mindmapId: userMindmapDetails.id,
        task: userMindmapDetails.description,
      };

      const response = await reGenerateMindmap({
        session: session,
        mindmapReqObject: mindmapReqObject,
      });

      const reader = response.getReader();

      if (!reader) {
        setIsGenerating(false);
        return;
      }

      let buffer = "";
      let currentLayers: any[] = [];
      let currentEdges: any[] = [];

      currentLayers;
      currentEdges;

      while (true as const) {
        const { done, value } = await reader.read();

        if (done) {
          setIsGenerating(false);
          const removeBacksticks = buffer.replace("json", "").replace("```", "").replace("```", "");

          const streamData = JSON.parse(removeBacksticks);

          setLayers(streamData.layers);
          setEdges(streamData.edges);

          break;
        }

        // Convert the chunk to text and clean up json markers
        const chunk = new TextDecoder().decode(value);

        buffer += chunk;

        // Try to find complete objects in the buffer
        while (true as const) {
          // const layerMatch = buffer.match(/{\s*"type"\s*:\s*"RECTANGLE"[^}]+}/);
          // const edgeMatch = buffer.match(/{\s*"id"\s*:\s*"edge_[^}]+}/);

          const layerMatch = buffer.match(/{\s*"type"\s*:\s*"RECTANGLE"[^}]*}(?=\s*(?:{|$))/);
          const edgeMatch = buffer.match(/{\s*"id"\s*:\s*"edge_[^}]*}(?=\s*(?:{|$))/);

          if (!layerMatch && !edgeMatch) break;

          try {
            if (layerMatch) {
              const layerObj = JSON.parse(layerMatch[0]);

              layerObj;

              // if (isValidLayer(layerObj)) {
              //   currentLayers = [...currentLayers, layerObj];
              //   setLayers(currentLayers);
              //   buffer = buffer.slice(layerMatch.index! + layerMatch[0].length);
              // }
            } else if (edgeMatch) {
              const edgeObj = JSON.parse(edgeMatch[0]);

              edgeObj;

              // if (isValidEdge(edgeObj)) {
              //   currentEdges = [...currentEdges, edgeObj];
              //   setEdges(currentEdges);
              //   buffer = buffer.slice(edgeMatch.index! + edgeMatch[0].length);
              // }
            }
            break;
          } catch (e) {
            // If JSON parsing fails, break the inner loop
            console.error("JSON parsing error:", e);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Stream processing error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickPrompt = (e: any, name: string, prompt: string) => {
    e.preventDefault();
    if (name === "Create PDF") {
      createPDF(prompt);
      return;
    }

    setText(prompt);
    sendPrompt({ event: e, prompt: prompt });
  };

  const handleSendPrompt = (event: any) => {
    if (event.code === "Enter") {
      event.preventDefault();
      sendPrompt({ event });
      return;
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
      name: "Create Document",
      prompt: `
      Create a professional document layout using proper HTML5 structure optimized for PDF conversion. Use Tailwind CSS for styling with these specific requirements:
Basic HTML Structure:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Document</title>
    <!-- Include Tailwind CSS -->
</head>
<body class="bg-white min-h-screen">
    <!-- Document content here -->
</body>
</html>

Document Structure:
Include a professional header with document name
Add a clean table of contents with proper spacing
Create distinct sections with clear hierarchy
Use print-friendly margins and padding


Typography:


Implement a professional font stack (e.g., Inter or Roboto)
Use proper heading hierarchy (h1-h6)
Set optimal line height and letter spacing for readability
Include page numbers in footers


Layout Specifications:


Use a single-column layout for main content
Two-column layout for specific sections where needed
Clear section breaks with subtle dividers
Proper spacing between paragraphs and sections


Styling:


Use a professional color palette (primary colors: navy blue, dark gray)
Include subtle shadows for depth
Add decorative elements like section indicators
Create styled blockquotes and callouts


Components:


Design tables with alternating row colors
Include styled lists (bullet points and numbered)
Add information boxes and alerts
Create styled code blocks if needed

All styling should use Tailwind's utility classes and focus on print optimization. The final layout should maintain its structure when converted to PDF format.

BE AS LONG AS POSSIBLE AND DETAILLED IN YOUR ANSWER TRUNCATE HTML AND DONT PUT WHITESPACES
      `,
    },
    {
      name: "Create Website",
      prompt: `Export the mindmap content as an HTML webpage, utilizing Tailwind CSS for creative styling. Employ a diverse color palette and experiment with various grid layouts, adjusting column and row configurations.
        
        Here is your task: 'Create a visually appealing, modern website featuring a table summarizing the mindmap's content. Incorporate a multi-section navigation with varying layouts and optimal letter spacing. Enhance the content with relevant images sourced from Unsplash or Pexels, ensuring they are free for commercial use. Prioritize readability and aesthetic appeal.'
        
        Important:
        Validate Image URLs: Before generating the HTML, verify the validity of each image URL"`,
    },
    {
      name: "Write E-mail",
      prompt: `
      Write a professional email summarizing this mindmap content also say that you are talking about this subject "${userMindmapDetails.name}]".

      Key points from the mind map:

      [Point 1]
      [Point 2]
      [Point 3]
      ...
      Please let me know if you have any questions or require further clarification.
      
      The e-mail is send by ${username}
      `,
    },
    {
      name: "Create PDF",
      prompt: "Automatically generate a PDF document of the mindmap.",
    },
    {
      name: "Generate User Story",
      prompt:
        "Create a user story based on the content of this mindmap. Determine the features using the content of the mindmap Use some font weight variations.",
    },
  ];

  if (safeSession)
    return (
      <>
        <form
          onSubmit={(event: any) => sendPrompt({ event })}
          className="relative flex flex-row items-start max-h-36 p-2 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
        >
          <Textarea
            className="resize-none overflow-y-hidden w-[90%] border-0 dark:text-white"
            placeholder={chatText("promptInput")}
            value={text}
            onKeyDown={handleSendPrompt}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Typing,
              })
            }
            onChange={(event) => handleTextareaChange(event)}
            disabled={isLoading}
            style={{ height: textareaHeight }}
            required
          />
          <Button
            className="absolute bottom-2 right-2 z-50"
            size="icon"
            disabled={isLoading || createdPDF.isLoading}
            type="submit"
          >
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
            {/* <Button onClick={handleGenerateMindmap} className="px-4 py-2" disabled={isGenerating}>
              <Sparkles className={isGenerating ? "animate-spin" : ""} height={size - 5} />
              <p className="dark:text-white">{uppercaseFirstLetter(indexText("generate"))}</p>
            </Button> */}
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
