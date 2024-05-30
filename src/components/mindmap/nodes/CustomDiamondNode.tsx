"use client";

import React, { memo, SetStateAction, useState } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useReactFlow } from "reactflow";
import { useRecoilValue } from "recoil";

import { CustomNodeProps } from "@/_types";
import { NodeToolbar } from "@/components";
import { useMindMap } from "@/hooks";
import { viewPortScaleState } from "@/state";

const CustomDiamondNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);
  const { pushToHistory } = useMindMap(undefined);

  const handleSize = "!w-[10px] !h-[10px]";

  const { getNode } = useReactFlow();

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

  const scaleStyle = useRecoilValue(viewPortScaleState);

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
        keepAspectRatio={true}
      />
      <div className="w-full h-full">
        <div className={`flex content-center items-center h-full w-full`}>
          <div className="relative h-full w-full py-2 px-6">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 h-[75%] w-[75%] border-2 rounded-xl bg-[#4d6aff1a]"></div>
            <input
              className="absolute top-0 left-0 w-full h-full nodeTextInput"
              type="text"
              value={inputText}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {selected && (
          <div style={scaleStyle}>
            <NodeToolbar nodeId={id} />
          </div>
        )}
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
    </>
  );
};

const MemoizedCustomDiamondNode = memo(CustomDiamondNode);

export { MemoizedCustomDiamondNode };
