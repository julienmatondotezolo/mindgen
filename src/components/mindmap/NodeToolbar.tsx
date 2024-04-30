import Image from "next/image";
import React, { useEffect } from "react";
import { Node, useNodes, useReactFlow } from "reactflow";

import boldIcon from "@/assets/icons/bold.svg";
import colorTextIcon from "@/assets/icons/colorText.svg";
import imageIcon from "@/assets/icons/image.svg";

interface NodeToolbarProps {
  className?: string;
  nodeId: string;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({ className, nodeId }) => {
  const { setNodes, getNode } = useReactFlow();
  const currentNode = getNode(nodeId);
  const isBold = currentNode?.style?.fontWeight == "800";
  const isBorderBig = currentNode?.data?.borderWidth == 4;

  const currentNodeData = currentNode?.data;

  const handleBoldNode = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.style = { ...node.style, fontWeight: isBold ? "inherit" : "800" };
        }
        return node;
      }),
    );
  };

  const handleBackgroundColor = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.style = {
            ...node.style,
            backgroundColor: nodeId?.style?.backgroundColor == "transparent" ? "#4D6AFF" : "transparent",
          };
        }

        return node;
      }),
    );
  };

  const handleBorderWidth = (width: string | number | undefined) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            borderWidth: width,
          };
        }

        return node;
      }),
    );
  };

  const listStyle = `w-6 h-6 p-2 bg-gray-50 hover:bg-primary-opaque rounded-md dark:bg-slate-800 hover:dark:bg-slate-600`;
  const isActive = "bg-primary-opaque dark:bg-slate-400/50";

  return (
    <div
      className={`mt-12 px-4 py-2 bg-white rounded-lg shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800 ${className}`}
    >
      <ul className="flex flex-row items-center justify-between">
        <div
          className={`${listStyle} ${isBold ? isActive : ""} cursor-pointer`}
          onClick={() => handleBoldNode()}
          aria-hidden="true"
        >
          <Image className="dark:invert" src={boldIcon} alt="Bold icon" />
        </div>
        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
        <div className={`${listStyle} cursor-pointer mr-1`} aria-hidden="true">
          <Image className="dark:invert cursor-pointer scale-125" src={colorTextIcon} alt="Text icon" />
        </div>
        <div
          className={`${listStyle} cursor-pointer relative`}
          onClick={() => handleBackgroundColor()}
          aria-hidden="true"
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
        <div
          className={`flex items-center ${listStyle} ${!isBorderBig ? isActive : ""} cursor-pointer  mr-1`}
          onClick={() => handleBorderWidth(2)}
          aria-hidden="true"
        >
          <figure className=" h-[1px] w-full bg-white"></figure>
        </div>
        <div
          className={`flex items-center ${listStyle} ${isBorderBig ? isActive : ""} cursor-pointer`}
          onClick={() => handleBorderWidth(4)}
          aria-hidden="true"
        >
          <figure className=" h-[3px] w-full bg-white"></figure>
        </div>
      </ul>
    </div>
  );
};

export { NodeToolbar };
