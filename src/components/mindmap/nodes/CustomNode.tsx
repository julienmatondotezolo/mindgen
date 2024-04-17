"use client";

import { memo, SetStateAction, useState } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useOnSelectionChange, useReactFlow } from "reactflow";
import { useRecoilState } from "recoil";

import { CustomNodeProps } from "@/_types";
import { useMindMap } from "@/hooks";
import { nodeSelectedState } from "@/state";

import { NodeToolbar } from "../NodeToolbar";

const CustomNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);
  // const setIsSelected = useSetRecoilState(nodeSelectedState);
  // const [isSelected, setIsSelected] = useRecoilState(nodeSelectedState);
  const [isSelected, setIsSelected] = useState(false);
  const { pushToHistory } = useMindMap(undefined);

  const handleSize = "!w-[10px] !h-[10px]";

  const { getNode } = useReactFlow();

  // Use the useOnSelectionChange hook to listen for selection changes
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const isNodeSelected = nodes.some((node) => node.id === id);
      // Update the isSelected state based on whether the node is selected

      setIsSelected(isNodeSelected);
      console.log("isNodeSelected:", isNodeSelected);
      console.log(
        "selectedNodes:",
        nodes.filter((node) => node.id === id),
      );
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
      <div className="relative flex content-center items-center h-full py-2 px-6 border-2 rounded-[100px] bg-[#4d6aff1a]">
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      {isSelected ? <NodeToolbar /> : <></>}
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
