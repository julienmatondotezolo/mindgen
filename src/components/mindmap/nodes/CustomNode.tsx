"use client";

import { useSession } from "next-auth/react";
import { memo, SetStateAction, useState } from "react";
import { Handle, Node, NodeResizer, Position, ResizeParams, useOnViewportChange, useReactFlow } from "reactflow";
import { useRecoilValue } from "recoil";

import { CustomNodeProps } from "@/_types";
import { NodeToolbar } from "@/components";
import { useMindMap } from "@/hooks";
import { collaboratorNameState } from "@/state";

const CustomNode = ({ id, data, selected, setNodes, setSourceHandle }: CustomNodeProps) => {
  const { getNode } = useReactFlow();
  const [scaleStyle, setScaleStyle] = useState({});

  useOnViewportChange({
    onChange: (viewport) => {
      const scale = 1.4 / viewport.zoom;

      setScaleStyle({ transform: `scale(${scale})` });
    },
  });

  const node = getNode(id);
  const [inputText, setInputText] = useState(data.label);
  const { pushToHistory } = useMindMap(undefined);

  const handleSize = "!w-[10px] !h-[10px]";

  const borderWidth = node?.data?.borderWidth ? node?.data?.borderWidth : 2;

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

  const session = useSession();

  const username = session.data?.session.user.username;

  const collaborateName = useRecoilValue(collaboratorNameState);

  return (
    <>
      <NodeResizer
        onResizeEnd={(e, params) => resizeNode(params)}
        minWidth={180}
        minHeight={45}
        color={username !== collaborateName ? "#FF4DC4" : "#4D6AFF"}
        handleStyle={{
          borderWidth: "10px",
          borderColor: username !== collaborateName ? "#FF4DC4" : "#4D6AFF",
          borderStyle: "solid",
          width: "10px",
          height: "10px",
          borderRadius: "3px",
        }}
        isVisible={selected}
      />
      <div
        className={`relative flex content-center items-center h-full py-2 px-6 border-${borderWidth} rounded-[100px] bg-[#4d6aff1a]`}
      >
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      {selected && username == collaborateName && (
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

const MemoizedCustomNode = memo(CustomNode);

export { MemoizedCustomNode };
