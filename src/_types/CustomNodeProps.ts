import { NodeProps } from "reactflow";

export type CustomNodeProps = NodeProps & {
  setNodes: any;
  setSourceHandle: any;
};

// export type CustomNodeProps = {
//   id: string;
//   data: {
//     label: string;
//   };
//   selected: boolean;
//   setNodes: any;
// };
