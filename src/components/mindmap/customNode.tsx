// import "@reactflow/node-resizer/dist/style.css";
// import "reactflow/dist/style.css";

import { NodeResizer } from "@reactflow/node-resizer";
import { memo, SetStateAction, useState } from "react";
import { Handle, Node, Position } from "reactflow";

import { CustomNodeProps } from "@/_types";

const CustomNode = ({ id, data, selected }: CustomNodeProps) => {
  // const resizeNode = (params: any) =>
  //   setNodes((event: any[]) =>
  //     event.concat({
  //       id: id,
  //       width: params.width,
  //       height: params.height,
  //     }),
  //   );

  const [inputText, setInputText] = useState(data.label);

  const resizeNode = (params: any) => {
    console.log("id:", id);
    console.log("params:", params);
    console.log("data:", data);
  };

  const handleInputChange = (event: { target: { value: SetStateAction<string> } }) => {
    setInputText(event.target.value);
  };

  return (
    <>
      <NodeResizer onResizeEnd={resizeNode} color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <div className="flex justify-center items-center h-full py-2 px-6 text-sm">
        <input type="text" value={inputText} onChange={handleInputChange} className="nodeTextInput" />
      </div>
      <Handle type="source" position={Position.Top} id="a" className="mt-[-5px]" />
      <Handle type="source" position={Position.Right} id="b" className="mr-[-5px]" />
      <Handle type="source" position={Position.Bottom} id="c" className="mb-[-5px]" />
      <Handle type="source" position={Position.Left} id="d" className="ml-[-5px]" />
    </>
  );
};

export default memo(CustomNode);
