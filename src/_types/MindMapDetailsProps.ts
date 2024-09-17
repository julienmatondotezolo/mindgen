import { Member, MindMapMessages } from ".";
import { Edge, Layer } from "./canvas";

export type MindMapDetailsProps = {
  id: string;
  layers: Layer[];
  edges: Edge[];
  name: string;
  description: string;
  conversation: string;
  creatorId: string;
  creatorUsername: string;
  picture_url: string;
  members: Member[];
  connectedMemberPermissions: string[];
  messages: MindMapMessages[];
  teams: string[];
  visibility: string;
};
