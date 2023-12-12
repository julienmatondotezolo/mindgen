import Image from "next/image";
import React from "react";

import starsIcon from "@/assets/icons/stars.svg";
import { Button, Input } from "@/components/";

function PromptTextInput() {
  const size = 15;

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <Input type="text" placeholder="Ask our generate anything related to this mind map" />
        </li>
        <li className="m-1">
          <Button>
            <Image src={starsIcon} height={size} width={size} alt="Stars icon" />
          </Button>
        </li>
      </ul>
    </div>
  );
}

export { PromptTextInput };
