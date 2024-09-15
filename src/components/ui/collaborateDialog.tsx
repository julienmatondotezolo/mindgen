/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { inviteAllCollaborators, removeCollaboratorById, updateCollaborators } from "@/_services";
import { Collaborator, DialogProps, Invitations, MindMapDetailsProps } from "@/_types";
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
  const collaboratorText = useTranslations("Collaborator");
  const modalRef = useRef<HTMLDivElement>(null);

  const [inviteCollaborator, setInviteCollaborator] = useState({ mindmapId, username: "", role: "ADMIN" });
  const [collaborators, setCollaborators] = useState<Collaborator[] | undefined>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFoundUsers, setNotFoundUsers] = useState([]);
  const [currentRole, setCurrentRole] = useState("");

  const queryClient = useQueryClient();

  const PERMISSIONS = userMindmap?.connectedCollaboratorPermissions;

  const collaboratorsLength = userMindmap ? userMindmap?.collaborators.length - 1 : 0;

  const fetchInviteCollaborator = useSyncMutation(inviteAllCollaborators, {
    onSuccess: (response: any) => {
      setNotFoundUsers([]);
      if (response.notFoundUsernames.length > 0 && response.notFoundUsernames != null)
        setNotFoundUsers(response.notFoundUsernames);
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("mindmap");
    },
  });

  const fetchUpdateCollaborator = useSyncMutation(updateCollaborators, {
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
    let collaborator: Collaborator;

    if (userId && userMindmap) {
      collaborator = userMindmap?.collaborators.filter((collaborator) => collaborator.userId == userId)[0];
      setCurrentRole(collaborator.role);
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
  const handleCollaborator = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCollaborator({ ...inviteCollaborator, username: e.target.value });
  };

  const handleCollaboratorRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInviteCollaborator({ ...inviteCollaborator, role: e.target.value });
  };

  const handleInviteCollaborator = async () => {
    try {
      const mappedCollaborators = {
        mindmapId,
        invitedCollaborators: [
          {
            username: inviteCollaborator.username,
            role: inviteCollaborator.role == "" ? "ADMIN" : inviteCollaborator.role,
          },
        ],
      };

      fetchInviteCollaborator.mutate(mappedCollaborators);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }

    setInviteCollaborator({ mindmapId, username: "", role: "" });
  };

  const handleCollaboratorRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, collaboratorIndex: number) => {
    // Assert that collaborators is an array
    const collaboratorsArray = collaborators as Collaborator[];

    // Find the index of the collaborator to update

    if (collaboratorIndex !== -1) {
      // Create a new array with the updated collaborator role
      const updatedCollaborators = [...collaboratorsArray];

      updatedCollaborators[collaboratorIndex].role = e.target.value;

      // Update the collaborators state
      setCollaborators(updatedCollaborators);
    }
  };

  const handleSave = () => {
    if (collaborators) {
      const mappedCollaborators = [
        collaborators.map((item) => ({
          collaboratorId: item.collaboratorId,
          role: item.role,
        })),
      ];

      fetchUpdateCollaborator.mutate(mappedCollaborators[0].slice(1));
    } else {
      console.warn("No collaborators to be saved");
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
          <p className="text-md font-bold mb-2">{uppercaseFirstLetter(collaboratorText("addCollaborator"))}</p>
          <p className="text-sm">{collaboratorText("collaboratorText")}</p>
          {checkPermission(PERMISSIONS, "UPDATE") && (
            <>
              <div className="flex flex-wrap justify-between w-full mt-4">
                <Input
                  value={inviteCollaborator.username}
                  onChange={handleCollaborator}
                  placeholder={`${uppercaseFirstLetter(collaboratorText("inviteCollaborator"))}`}
                  className="py-4 w-fit"
                />
                <select
                  className="bg-transparent border-2 rounded-xl text-sm"
                  value={inviteCollaborator.role}
                  onChange={(e) => handleCollaboratorRole(e)}
                >
                  <option value="ADMIN">{collaboratorText("admin")}</option>
                  <option value="CONTRIBUTOR">{collaboratorText("contributor")}</option>
                  <option value="VIEWER">{collaboratorText("viewer")}</option>
                </select>
                <Button onClick={handleInviteCollaborator}>{uppercaseFirstLetter(text("invite"))}</Button>
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
          {collaboratorsLength < 1
            ? collaboratorText("noCollaborator")
            : `${collaboratorsLength} ${collaboratorText(
                collaboratorsLength > 1 ? `collaborators` : `collaborator`,
              ).toLowerCase()}`}
        </p>
        {!userMindmap ? (
          <>
            <Skeleton className="w-full h-16 bg-slate-600" />
            <Skeleton className="w-full h-16 bg-slate-600" />
          </>
        ) : (
          userMindmap?.collaborators.map((collaborator: Collaborator, index) => (
            <article
              key={collaborator.collaboratorId}
              className="flex flex-wrap items-center justify-between p-4 bg-gray-100 hover:bg-primary-opaque dark:bg-slate-800 hover:dark:bg-slate-600 rounded-xl"
            >
              <section className="flex items-center">
                <figure
                  className={`flex h-6 w-6 ${
                    collaborator.role == "OWNER" ? "bg-primary-color" : "bg-[#1fb865]"
                  } mr-4 rounded-full`}
                >
                  <p className="m-auto text-xs">{collaborator.username.substring(0, 1).toUpperCase()}</p>
                </figure>
                <div>{uppercaseFirstLetter(collaborator.username)}</div>
              </section>
              {collaborator.role == "OWNER" ? (
                <div className="text-sm px-4 py-2 border rounded-lg opacity-50">
                  {collaboratorText(collaborator.role.toLowerCase())}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <select
                    className="bg-transparent border p-2 rounded-lg text-sm"
                    value={collaborators ? collaborators[index]?.role : ""}
                    onChange={(e) => handleCollaboratorRoleChange(e, index)}
                    disabled={!checkPermission(PERMISSIONS, "UPDATE")}
                  >
                    <option value="ADMIN">{collaboratorText("admin")}</option>
                    <option value="CONTRIBUTOR">{collaboratorText("contributor")}</option>
                    <option value="VIEWER">{collaboratorText("viewer")}</option>
                  </select>
                  {checkPermission(PERMISSIONS, "DELETE") && (
                    <>
                      {isDeleting ? (
                        <p className="text-xs text-[#ee6a63]">Deleting....</p>
                      ) : (
                        <button
                          onClick={() => handleRemove(collaborator.collaboratorId)}
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
      {currentRole == "OWNER" && collaborators!.length > 1 ? (
        <button className="text-xs text-[#ee6a63] cursor-pointer">Transfer ownsership</button>
      ) : (
        <button className="text-xs text-[#ee6a63] cursor-pointer">Leave project</button>
      )}
      {checkPermission(PERMISSIONS, "UPDATE") && collaborators!.length > 1 && (
        <section className="flex justify-end">
          <Button onClick={handleSave}>{uppercaseFirstLetter(text("save"))}</Button>
        </section>
      )}
    </div>
  );
};

export { CollaborateDialog };
