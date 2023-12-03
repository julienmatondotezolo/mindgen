import { memo } from "react";
import { Handle, NodeResizer, Position } from "reactflow";

type ResizableNodeProps = {
  data: {
    label: string;
  };
};

const ResizableNode = ({ data }: ResizableNodeProps) => (
  <>
    <NodeResizer minWidth={100} minHeight={30} />
    <Handle type="target" position={Position.Left} />
    <div style={{ padding: 10 }}>{data.label}</div>
    <Handle type="source" position={Position.Right} />
  </>
);

export default memo(ResizableNode);
