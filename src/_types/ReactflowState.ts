/* eslint-disable no-unused-vars */
import { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange } from "reactflow";

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
};
