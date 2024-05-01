import Image from "next/image";
import React, { useState } from "react";
import { useReactFlow } from "reactflow";

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
  const isBackgroundColor = currentNode?.style?.backgroundColor;
  const isUnderlineText = currentNode?.style?.textDecoration == "underline";

  const [isSecondDivVisible, setIsSecondDivVisible] = useState(false);

  // Define the JSON with colors
  const colorsJson = [
    { color: "#4D6AFF" },
    { color: "#9A4DFF" },
    { color: "#FF6A4D" },
    { color: "#126D08" },
    { color: "#414243" },
  ];

  const handleBoldNode = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.style = { ...node.style, fontWeight: isBold ? "inherit" : "800" };
        }
        return node;
      }),
    );
  };

  const handleUnderlineText = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.style = {
            ...node.style,
            textDecoration: isUnderlineText ? "none" : "underline",
          };
        }

        return node;
      }),
    );
  };

  const handleColorPicker = () => {
    setIsSecondDivVisible(!isSecondDivVisible);
  };

  const handleBackgroundColor = (color: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.style = {
            ...node.style,
            backgroundColor: color,
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
  const isActive = "bg-primary-opaque dark:bg-slate-400/40";

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
        <div
          className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"
          onClick={() => handleColorPicker()}
          aria-hidden="true"
        ></div>
        <div
          className={`${listStyle} ${isUnderlineText ? isActive : ""} cursor-pointer mr-1`}
          onClick={() => handleUnderlineText()}
          aria-hidden="true"
        >
          <Image className="dark:invert cursor-pointer scale-125" src={colorTextIcon} alt="Text icon" />
        </div>
        <div
          className={`relative ${listStyle} ${isSecondDivVisible ? isActive : ""} cursor-pointer`}
          onClick={() => handleColorPicker()}
          aria-hidden="true"
        >
          <figure
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full grid`}
            style={{ backgroundColor: !isBackgroundColor ? "#4D6AFF" : currentNode?.style?.backgroundColor }}
          ></figure>
          {isSecondDivVisible && (
            <div className="absolute top-12 left-0 p-2 bg-white rounded-lg shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800 grid grid-cols-4 gap-8">
              {colorsJson.map((colorObj, index) => (
                <figure
                  key={index}
                  className={`h-4 w-4 rounded-full`}
                  style={{ backgroundColor: colorObj.color }}
                  onClick={() => handleBackgroundColor(colorObj.color)}
                  aria-hidden="true"
                ></figure>
              ))}
            </div>
          )}
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
