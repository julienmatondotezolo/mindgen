// import "@reactflow/node-resizer/dist/style.css";
// import "reactflow/dist/style.css";

import { NodeResizer } from "@reactflow/node-resizer";
import { memo, SetStateAction, useState } from "react";
import { Handle, Node, Position } from "reactflow";

import { CustomNodeProps } from "@/_types";

const CustomNode = ({ id, data, selected, setNodes }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);

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

  return (
    <>
      <NodeResizer onResizeEnd={resizeNode} color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <div className="flex justify-center items-center h-full py-2 px-6 text-sm">
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      <Handle type="source" position={Position.Top} id="top" className="mt-[-5px]" />
      <Handle type="source" position={Position.Right} id="right" className="mr-[-5px]" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="mb-[-5px]" />
      <Handle type="source" position={Position.Left} id="left" className="ml-[-5px]" />
    </>
  );
};

export default memo(CustomNode);
