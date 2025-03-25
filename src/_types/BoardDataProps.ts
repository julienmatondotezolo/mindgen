import { Member, MindMapMessages } from ".";
import { Edge, Layer } from "./canvas";

export type BoardDataProps = {
  id: string;
  name: string;
  description: string;
  layers: Layer[];
  edges: Edge[];
  connectedMemberPermissions: string[];
  conversation: MindMapMessages[];
  creatorId: string;
  creatorUsername: string;
  members: Member[];
  picture_url: string;
  organizationId: string;
  pictureUrl: string;
  teams: string[];
  visibility: string;
};
