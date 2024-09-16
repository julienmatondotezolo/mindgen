import { Collaborator, MindMapMessages } from ".";
import { Edge, Layer } from "./canvas";

export type MindMapDetailsProps = {
  id: string;
  layers: Layer[];
  edges: Edge[];
  name: string;
  description: string;
  creatorId: string;
  creatorUsername: string;
  picture_url: string;
  collaborators: Collaborator[];
  connectedCollaboratorPermissions: string[];
  messages: MindMapMessages[];
  visibility: string;
};
