"use client";

import React, { memo } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useReactFlow } from "reactflow";

import { CustomNodeProps } from "@/_types";

const CustomImageNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const handleSize = "!w-[10px] !h-[10px]";

  const { getNode } = useReactFlow();
  const node = getNode(id);

  const resizeNode = (params: ResizeParams) => {
    // Update the node's dimensions
    const updatedNode = {
      ...node,
      width: params.width,
      height: params.height,
    };

    // Update the nodes array with the updated node
    setNodes((nodes: Node[]) => nodes.map((n) => (n.id === id ? updatedNode : n)));
  };

  return (
    <>
      <NodeResizer
        onResizeEnd={(e: any, params: any) => resizeNode(params)}
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

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundSize: "cover",
          backgroundImage: `url(${data.image.url})`,
          backgroundRepeat: "no-repeat",
        }}
      ></div>
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

const MemoizedCustomImageNode = memo(CustomImageNode);

export { MemoizedCustomImageNode };
