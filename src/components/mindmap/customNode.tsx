// import "@reactflow/node-resizer/dist/style.css";
// import "reactflow/dist/style.css";

import { NodeResizer } from "@reactflow/node-resizer";
import { memo } from "react";
import { Handle, Node, Position } from "reactflow";

import { CustomNodeProps } from "@/_types";

// width: params.width,
// height: params.height,

const customNode = ({ id, data, selected, setNodes }: CustomNodeProps) => {
  // const resizeNode = (params: any) =>
  //   setNodes((event: any[]) =>
  //     event.concat({
  //       id: id,
  //       width: params.width,
  //       height: params.height,
  //     }),
  //   );

  const handleClick = (params: any) => {
    setNodes((nodes: Node[]) =>
      nodes.map((node) => {
        if (node.id === id) {
          node.height = params.height;
          node.width = params.width;
          // console.log("node:", node);
        }

        // node.id === id ? { ...node, data: { ...node.data, label: "New Label" } } : node;
      }),
    );
  };

  return (
    <>
      <NodeResizer onResizeEnd={handleClick} color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <div className="py-2 px-6 border-2 border-slate-800 text-sm top-6">{data.label}</div>
      <Handle type="source" position={Position.Top} id="a" className="mt-[-5px]" />
      <Handle type="source" position={Position.Right} id="b" className="mr-[-5px]" />
      <Handle type="source" position={Position.Bottom} id="c" className="mb-[-5px]" />
      <Handle type="source" position={Position.Left} id="d" className="ml-[-5px]" />
    </>
  );
};

export default memo(customNode);
