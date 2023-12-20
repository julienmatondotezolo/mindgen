import Image from "next/image";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

import { promptResultState, promptValueState } from "@/app/recoil";
import starsIcon from "@/assets/icons/stars.svg";
import { Button, Textarea } from "@/components/";

function PromptTextInput() {
  const size = 20;

  const setPromptValue = useSetRecoilState(promptValueState);
  const setPromptResult = useSetRecoilState(promptResultState);

  const [text, setText] = useState("");
  const [textareaHeight, setTextareaHeight] = useState("36px");

  const [isLoading, setIsLoading] = useState(false);

  const handleTextareaChange = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default behavior (new line)
    } else {
      setText(event.target.value);
      event.target.style.height = "36px";
      const newHeight = event.target.scrollHeight;

      setTextareaHeight(newHeight + "px");
    }
  };

  const handleEnterPress = () => {
    setIsLoading(true);
    setPromptResult(true);

    setTimeout(() => {
      setIsLoading(false);
      setPromptValue(text);
      setText("");
    }, 1000);
  };

  return (
    <div className="relative flex flex-row items-start max-h-36 overflow-y-auto py-2 pr-2 bg-white rounded-xl shadow-lg">
      <Textarea
        className="resize-none overflow-y-hidden w-[90%]"
        placeholder="Ask our generate anything related to this mind map..."
        value={text}
        onChange={handleTextareaChange}
        style={{ height: textareaHeight }}
      />
      <Button onClick={handleEnterPress} className="absolute bottom-2 right-2" size="icon" disabled={isLoading}>
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
