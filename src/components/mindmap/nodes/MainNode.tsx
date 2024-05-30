"use client";

import { NodeResizer } from "@reactflow/node-resizer";
import { memo, SetStateAction, useState } from "react";
import { Handle, Node, Position } from "reactflow";
import { useRecoilValue } from "recoil";

import { CustomNodeProps } from "@/_types";
import { NodeToolbar } from "@/components";
import { viewPortScaleState } from "@/state";

const MainNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);
  const size = 10;
  const handleSize = `!w-[${size}px] !h-[${size}px]`;

  const resizeNode = (params: any) => {
    setNodes((nodes: Node[]) =>
      nodes.map((node) => {
        if (node.id === id) {
          // Create a new object to notify React Flow about the change
          return { ...node, height: params.height };
        }
        return node;
      }),
    );
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
      />
      <div className="flex content-center items-center h-full py-2 px-6 border-2 rounded-[100px] bg-[#4d6aff1a]">
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      {selected && (
        <div style={scaleStyle}>
          <NodeToolbar nodeId={id} />
        </div>
      )}
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

const MemoizedMainNode = memo(MainNode);

export { MemoizedMainNode };
