/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { inviteAllMembers, removeCollaboratorById, updateMembers } from "@/_services";
import { DialogProps, Member, MindMapDetailsProps } from "@/_types";
import { Button, Input, Skeleton } from "@/components";
import { useSyncMutation } from "@/hooks";
import { checkPermission, uppercaseFirstLetter } from "@/utils";

interface CollaborateDialogProps extends DialogProps {
  mindmapId: string;
  userMindmap: MindMapDetailsProps;
}

const CollaborateDialog: FC<CollaborateDialogProps> = ({ open, setIsOpen, mindmapId, userMindmap }) => {
  const session = useSession();
  const text = useTranslations("Index");
  const memberText = useTranslations("Member");
  const modalRef = useRef<HTMLDivElement>(null);

  const [inviteMembers, setInviteMembers] = useState({ mindmapId, username: "", role: "ADMIN" });
  const [members, setMembers] = useState<Member[] | undefined>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFoundUsers, setNotFoundUsers] = useState([]);
  const [currentRole, setCurrentRole] = useState("");

  const queryClient = useQueryClient();

  const PERMISSIONS = userMindmap?.connectedMemberPermissions;

  const membersLength = userMindmap ? userMindmap?.members.length - 1 : 0;

  const fetchInviteMembers = useSyncMutation(inviteAllMembers, {
    onSuccess: (response: any) => {
      setNotFoundUsers([]);
      if (response.notFoundUsernames.length > 0 && response.notFoundUsernames != null)
        setNotFoundUsers(response.notFoundUsernames);
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("mindmap");
    },
  });

  const fetchUpdateCollaborator = useSyncMutation(updateMembers, {
    onSuccess: () => {
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("mindmap");
    },
  });

  const { mutateAsync } = useMutation(removeCollaboratorById);

  const handleRemove = async (collaboratorId: string) => {
    try {
      setIsDeleting(true);
      await mutateAsync(collaboratorId, {
        onSuccess: () => {
          // Invalidate the query to cause a re-fetch
          queryClient.invalidateQueries("mindmap");
          setIsDeleting(false);
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const userId = session.data?.session?.user.id;
    let collaborator: Member;

    if (userId && userMindmap) {
      collaborator = userMindmap?.members.filter((collaborator) => collaborator.userId == userId)[0];
      setCurrentRole(collaborator.mindmapRole);
    }
  }, [session, userMindmap]);

  // Invalidate the query when the dialog opens
  useEffect(() => {
    if (open) {
      queryClient.invalidateQueries("mindmap");
    }
  }, [open, queryClient]);

  const handleClose = () => {
    queryClient.invalidateQueries("mindmap");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
        queryClient.invalidateQueries("mindmap");
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update state when input changes
  const handleMember = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteMembers({ ...inviteMembers, username: e.target.value });
  };

  const handleMemberRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInviteMembers({ ...inviteMembers, role: e.target.value });
  };

  const handleInviteMembers = async () => {
    try {
      const mappedmembers = {
        mindmapId,
        invitedmembers: [
          {
            username: inviteMembers.username,
            role: inviteMembers.role == "" ? "ADMIN" : inviteMembers.role,
          },
        ],
      };

      fetchInviteMembers.mutate(mappedmembers);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }

    setInviteMembers({ mindmapId, username: "", role: "" });
  };

  const handleMemberRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, memberIndex: number) => {
    // Assert that members is an array
    const membersArray = members as Member[];

    // Find the index of the collaborator to update

    if (memberIndex !== -1) {
      // Create a new array with the updated collaborator role
      const updatedmembers = [...membersArray];

      updatedmembers[memberIndex].mindmapRole = e.target.value;

      // Update the members state
      setMembers(updatedmembers);
    }
  };

  const handleSave = () => {
    if (members) {
      const mappedmembers = [
        members.map((item) => ({
          memberId: item.memberId,
          role: item.mindmapRole,
        })),
      ];

      fetchUpdateCollaborator.mutate(mappedmembers[0].slice(1));
    } else {
      console.warn("No members to be saved");
    }
  };

  return (
    <div
      ref={modalRef}
      className={`${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <article className="flex flex-wrap justify-between w-full">
        <p className="font-bold text-xl">{uppercaseFirstLetter(text("collaborate"))}</p>
        <X className="cursor-pointer" onClick={handleClose} />
      </article>
      <div className="w-full mt-4 space-y-6">
        <article className="w-full">
          <p className="text-md font-bold mb-2">{uppercaseFirstLetter(memberText("addMember"))}</p>
          <p className="text-sm">{memberText("memberText")}</p>
          {checkPermission(PERMISSIONS, "UPDATE") && (
            <>
              <div className="flex flex-wrap justify-between w-full mt-4">
                <Input
                  value={inviteMembers.username}
                  onChange={handleMember}
                  placeholder={`${uppercaseFirstLetter(memberText("addMember"))}`}
                  className="py-4 w-fit"
                />
                <select
                  className="bg-transparent border-2 rounded-xl text-sm"
                  value={inviteMembers.role}
                  onChange={(e) => handleMemberRole(e)}
                >
                  <option value="ADMIN">{memberText("admin")}</option>
                  <option value="CONTRIBUTOR">{memberText("contributor")}</option>
                  <option value="VIEWER">{memberText("viewer")}</option>
                </select>
                <Button onClick={handleInviteMembers}>{uppercaseFirstLetter(text("add"))}</Button>
              </div>
              <section className="w-full space-y-1 mt-4">
                {notFoundUsers.map((notFoundUser, index) => (
                  <p key={index} className="text-xs text-red-500">
                    {notFoundUser} not found
                  </p>
                ))}
              </section>
            </>
          )}
        </article>
        {/* {checkPermission(PERMISSIONS, "UPDATE") && (
          <p className="text-md font-bold mb-2">
            {userMindmap?.invitations.length
              ? `${userMindmap?.invitations.length} ${text(
                  userMindmap?.invitations.length > 1 ? `invitations` : `invitation`,
                )}`
              : null}
          </p>
        )} */}
        {/* {checkPermission(PERMISSIONS, "UPDATE") &&
          userMindmap?.invitations.map((invitations: Invitations) => (
            <article
              key={invitations.id}
              className="flex flex-wrap items-center justify-between p-4 bg-gray-100 hover:bg-primary-opaque dark:bg-slate-800 hover:dark:bg-slate-600 rounded-xl"
            >
              <section className="flex items-center">
                <figure
                  className={`flex h-6 w-6 ${
                    invitations.role == "OWNER" ? "bg-primary-color" : "bg-[#1fb865]"
                  } mr-4 rounded-full`}
                >
                  <p className="m-auto text-xs">{invitations.inviteeUsername.substring(0, 1).toUpperCase()}</p>
                </figure>
                <div>{uppercaseFirstLetter(invitations.inviteeUsername)}</div>
              </section>

              <div className="bg-transparent border p-2 rounded-lg text-sm">
                {collaboratorText(invitations.role.toLowerCase())}
              </div>

              <p className="text-xs font-bold text-[#eea463] cursor-pointer">
                {uppercaseFirstLetter(text(invitations.status.toLowerCase()))}
              </p>
            </article>
          ))} */}
        <p className="text-md font-bold mb-2">
          {membersLength < 1
            ? memberText("noMember")
            : `${membersLength} ${memberText(membersLength > 1 ? `members` : `collaborator`).toLowerCase()}`}
        </p>
        {!userMindmap ? (
          <>
            <Skeleton className="w-full h-16 bg-slate-600" />
            <Skeleton className="w-full h-16 bg-slate-600" />
          </>
        ) : (
          userMindmap?.members.map((member: Member, index) => (
            <article
              key={member.memberId}
              className="flex flex-wrap items-center justify-between p-4 bg-gray-100 hover:bg-primary-opaque dark:bg-slate-800 hover:dark:bg-slate-600 rounded-xl"
            >
              <section className="flex items-center">
                <figure
                  className={`flex h-6 w-6 ${
                    member.mindmapRole == "CREATOR" ? "bg-primary-color" : "bg-[#1fb865]"
                  } mr-4 rounded-full`}
                >
                  <p className="m-auto text-xs dark:text-">{member.username.substring(0, 1).toUpperCase()}</p>
                </figure>
                <div>{uppercaseFirstLetter(member.username)}</div>
              </section>
              {member.organizationRole == "OWNER" ? (
                <div className="text-sm px-4 py-2 border rounded-lg opacity-50">
                  {memberText(member.organizationRole.toLowerCase())}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <select
                    className="bg-transparent border p-2 rounded-lg text-sm"
                    value={members ? members[index]?.mindmapRole : ""}
                    onChange={(e) => handleMemberRoleChange(e, index)}
                    disabled={!checkPermission(PERMISSIONS, "UPDATE")}
                  >
                    <option value="ADMIN">{memberText("admin")}</option>
                    <option value="CONTRIBUTOR">{memberText("contributor")}</option>
                    <option value="VIEWER">{memberText("viewer")}</option>
                  </select>
                  {checkPermission(PERMISSIONS, "DELETE") && (
                    <>
                      {isDeleting ? (
                        <p className="text-xs text-[#ee6a63]">Deleting....</p>
                      ) : (
                        <button
                          onClick={() => handleRemove(member.memberId)}
                          className="text-xs text-[#ee6a63] cursor-pointer"
                        >
                          {uppercaseFirstLetter(text("remove"))}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>
      {currentRole == "CREATOR" && members!.length > 1 ? (
        <button className="text-xs text-[#ee6a63] cursor-pointer">Transfer ownsership</button>
      ) : (
        <button className="text-xs text-[#ee6a63] cursor-pointer">Leave project</button>
      )}
      {checkPermission(PERMISSIONS, "UPDATE") && members!.length > 1 && (
        <section className="flex justify-end">
          <Button onClick={handleSave}>{uppercaseFirstLetter(text("save"))}</Button>
        </section>
      )}
    </div>
  );
};

export { CollaborateDialog };
