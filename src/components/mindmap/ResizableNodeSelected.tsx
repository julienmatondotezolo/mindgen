import "@reactflow/node-resizer/dist/style.css";

import { NodeResizer } from "@reactflow/node-resizer";
import { memo } from "react";
import { Handle, Position } from "reactflow";

type ResizableNodeSelectedProps = {
  data: {
    label: string;
  };
  selected: boolean;
};

const ResizableNodeSelected = ({ data, selected }: ResizableNodeSelectedProps) => (
  <>
    <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
    <Handle type="target" position={Position.Left} />
    <div className="flex justify-center p-2 bg-white rounded-lg w-40 text-sm text-center border border-gray-700 ">
      {data.label}
    </div>
    <Handle type="source" position={Position.Right} />
  </>
);

export default memo(ResizableNodeSelected);
