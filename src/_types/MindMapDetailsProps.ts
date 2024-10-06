import { Member, MindMapMessages } from ".";
import { Edge, Layer } from "./canvas";

export type MindMapDetailsProps = {
  id: string;
  layers: Layer[];
  edges: Edge[];
  name: string;
  description: string;
  conversation: MindMapMessages[];
  creatorId: string;
  creatorUsername: string;
  picture_url: string;
  members: Member[];
  connectedMemberPermissions: string[];
  teams: string[];
  visibility: string;
};
