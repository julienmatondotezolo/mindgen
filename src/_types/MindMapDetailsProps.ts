import { Edge, Node, Viewport } from "reactflow";

import { Collaborator, MindMapMessages } from ".";

export type MindMapDetailsProps = {
  id: string;
  collaborators: Collaborator[];
  creatorId: string;
  creatorUsername: string;
  messages: MindMapMessages[];
  edges: Edge[];
  nodes: Node[];
  viewport: Viewport;
};
