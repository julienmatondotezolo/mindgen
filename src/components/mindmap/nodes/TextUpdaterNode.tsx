import { useCallback } from "react";
import { Handle, Position } from "reactflow";

type TextUpdaterNodeProps = {
  data: {
    label: string;
  };
  isConnectable: boolean;
};

function TextUpdaterNode({ data, isConnectable }: TextUpdaterNodeProps) {
  const onChange = useCallback((evt: { target: { value: any } }) => evt.target.value, []);

  return (
    <div className="flex justify-center p-2 bg-white rounded-lg w-40 text-sm text-center border border-gray-700 ">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        <input id="text" name="text" onChange={onChange} />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
      {/* <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} /> */}
    </div>
  );
}

export { TextUpdaterNode };
