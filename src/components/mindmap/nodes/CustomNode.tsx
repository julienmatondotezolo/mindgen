"use client";

import { memo, SetStateAction, useState } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useOnSelectionChange, useReactFlow } from "reactflow";

import { CustomNodeProps } from "@/_types";
import { NodeToolbar } from "@/components";
import { useMindMap } from "@/hooks";

const CustomNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const [inputText, setInputText] = useState(data.label);
  const [isSelected, setIsSelected] = useState(false);
  const { pushToHistory } = useMindMap(undefined);

  const handleSize = "!w-[10px] !h-[10px]";

  const { getNode } = useReactFlow();
  const node = getNode(id);

  // Use the useOnSelectionChange hook to listen for selection changes
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const isNodeSelected = nodes.some((node) => node.id === id);
      // Update the isSelected state based on whether the node is selected

      setIsSelected(isNodeSelected);
    },
  });

  const resizeNode = (params: ResizeParams) => {
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
        color={node?.data.selectedByCollaborator == true ? "#FF4DC4" : "#4D6AFF"}
        handleStyle={{
          borderWidth: "10px",
          borderColor: node?.data.selectedByCollaborator == true ? "#FF4DC4" : "#4D6AFF",
          borderStyle: "solid",
          width: "10px",
          height: "10px",
          borderRadius: "3px",
        }}
        isVisible={selected}
      />
      <div className="relative flex content-center items-center h-full py-2 px-6 border-2 rounded-[100px] bg-[#4d6aff1a]">
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      {isSelected && <NodeToolbar nodeId={id} />}
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
