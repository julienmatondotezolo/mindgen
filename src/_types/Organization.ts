import { Member } from "./Member";

export type Organization = {
  id: string;
  name: string;
  members: Member[];
};
