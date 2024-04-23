import Image from "next/image";
import React, { useEffect } from "react";
import { useReactFlow } from "reactflow";

import boldIcon from "@/assets/icons/bold.svg";
import colorTextIcon from "@/assets/icons/colorText.svg";
import imageIcon from "@/assets/icons/image.svg";

interface NodeToolbarProps {
  nodeId: string;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({ nodeId }) => {
  const { setNodes } = useReactFlow();

  const handleBoldNode = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.style = { ...node.style, fontWeight: 800 };
        }

        return node;
      }),
    );
  };

  const listStyle =
    "w-6 h-6 p-2 bg-gray-50 hover:bg-primary-opaque rounded-md dark:bg-slate-800 hover:dark:bg-slate-600";

  return (
    <div
      className={`mt-12 px-4 py-2 bg-white rounded-lg shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800`}
    >
      <ul className="flex flex-row items-center justify-between">
        <div className={`${listStyle} cursor-pointer`} onClick={() => handleBoldNode()} aria-hidden="true">
          <Image className="dark:invert" src={boldIcon} alt="Bold icon" />
        </div>
        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
        <div className={`${listStyle} cursor-pointer`}>
          <Image className="dark:invert cursor-pointer scale-125" src={colorTextIcon} alt="Text icon" />
        </div>
        <div
          className={`${listStyle} cursor-pointer relative
            `}
        >
          <figure className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary-color"></figure>
        </div>
        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
        <div className={`${listStyle} cursor-pointer relative`}>
          <Image
            className="dark:invert absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3"
            src={imageIcon}
            alt="Image icon"
          />
        </div>
        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
        <div className={`flex items-center ${listStyle} cursor-pointer`}>
          <figure className=" h-[1px] w-full bg-white"></figure>
        </div>
        <div className={`flex items-center ${listStyle} cursor-pointer`}>
          <figure className=" h-[2px] w-full bg-white"></figure>
        </div>
      </ul>
    </div>
  );
};

export { NodeToolbar };
