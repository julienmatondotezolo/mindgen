/* eslint-disable no-unused-vars */

export enum MindmapRole {
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
  CONTRIBUTOR = "CONTRIBUTOR",
  VIEWER = "VIEWER",
}

export enum OrganizationRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export type Member = {
  memberId: string;
  userId: string;
  username: string;
  email: string;
  mindmapRole: MindmapRole;
  organizationRole: OrganizationRole;
};
