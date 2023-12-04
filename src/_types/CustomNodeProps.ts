import { NodeProps } from "reactflow";

export type CustomNodeProps = NodeProps & {
  setNodes: any;
};

// export type CustomNodeProps = {
//   id: string;
//   data: {
//     label: string;
//   };
//   selected: boolean;
//   setNodes: any;
// };
