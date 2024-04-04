"use client";

import Image from "next/image";
import { memo, SetStateAction, useState } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useOnSelectionChange, useReactFlow } from "reactflow";

import { CustomNodeProps } from "@/_types";
import boldIcon from "@/assets/icons/bold.svg";
import colorTextIcon from "@/assets/icons/colorText.svg";
import imageIcon from "@/assets/icons/image.svg";
import { useMindMap } from "@/hooks";

const CustomNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);
  const [isSelected, setIsSelected] = useState(false);
  const { pushToHistory } = useMindMap(undefined);

  const handleSize = "!w-[10px] !h-[10px]";

  const { getNode } = useReactFlow();

  // Use the useOnSelectionChange hook to listen for selection changes
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setIsSelected(nodes.some((node) => node.id === id));
    },
  });

  const resizeNode = (params: ResizeParams) => {
    const node = getNode(id);

    // Update the node's dimensions
    const updatedNode = {
      ...node,
      width: params.width,
      height: params.height,
    };

    // Update the nodes array with the updated node
    setNodes((nodes: Node[]) => nodes.map((n) => (n.id === id ? updatedNode : n)));
    pushToHistory();
  };

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => {
    setInputText(event.target.value);
    setNodes((nodes: Node[]) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: event.target.value } };
        }
        return node;
      }),
    );
  };

  const listStyle =
    "w-6 h-6 p-2 bg-gray-50 hover:bg-primary-opaque rounded-md dark:bg-slate-800 hover:dark:bg-slate-600";

  return (
    <>
      <NodeResizer
        onResizeEnd={(e, params) => resizeNode(params)}
        minWidth={180}
        minHeight={45}
        color="#4D6AFF"
        handleStyle={{
          borderWidth: "10px", // Adjust border thickness here
          borderColor: "#4D6AFF", // Ensure the border color matches the color prop or is set to your preference
          borderStyle: "solid", // Specify the border style
          width: "10px",
          height: "10px",
          borderRadius: "3px",
        }}
        isVisible={selected}
      />
      <div className="flex content-center items-center h-full py-2 px-6 border-2 rounded-[100px] bg-[#4d6aff1a]">
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      <Handle
        onMouseDown={() => setSourceHandle("top")}
        type="source"
        position={Position.Top}
        id="top"
        className={`mt-[-15px] ${handleSize}`}
      />
      <Handle
        onMouseDown={() => setSourceHandle("right")}
        type="source"
        position={Position.Right}
        id="right"
        className={`mr-[-15px] ${handleSize}`}
      />
      <Handle
        onMouseDown={() => setSourceHandle("bottom")}
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={`mb-[-15px] ${handleSize}`}
      />
      <Handle
        onMouseDown={() => setSourceHandle("left")}
        type="source"
        position={Position.Left}
        id="left"
        className={`ml-[-15px] ${handleSize}`}
      />
      {isSelected && (
        <div className="mt-12 px-4 py-2 bg-white rounded-lg shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
          <ul className="flex flex-row items-center justify-between">
            <div className={`${listStyle} cursor-pointer`}>
              <Image className="dark:invert" src={boldIcon} alt="Mouse icon" />
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
      )}
    </>
  );
};

const MemoizedCustomNode = memo(CustomNode);

export { MemoizedCustomNode };
