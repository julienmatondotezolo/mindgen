"use client";

import { memo, SetStateAction, useState } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useReactFlow } from "reactflow";

import { CustomNodeProps } from "@/_types";

const CustomNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);

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
      <div className="flex justify-center items-center h-full py-2 px-6">
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
    </>
  );
};

const MemoizedCustomNode = memo(CustomNode);

export { MemoizedCustomNode };
