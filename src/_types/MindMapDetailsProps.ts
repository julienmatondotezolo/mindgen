import { Edge, Node, Viewport } from "reactflow";

import { Collaborator } from ".";

export type MindMapDetailsProps = {
  id: string;
  collaborators: Collaborator[];
  creatorId: string;
  creatorUsername: string;
  messages: string[];
  edges: Edge[];
  nodes: Node[];
  viewport: Viewport;
};
