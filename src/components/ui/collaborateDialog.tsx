/* eslint-disable jsx-a11y/label-has-associated-control */
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { addNewCollaborator, getMindmapById, removeCollaboratorById } from "@/_services";
import { Collaborator, DialogProps, MindMapDetailsProps } from "@/_types";
import { Button, Input, Skeleton } from "@/components";
import { useSyncMutation } from "@/hooks";
import { uppercaseFirstLetter } from "@/utils";

interface CollaborateDialogProps extends DialogProps {
  mindmapId: string;
}

const CollaborateDialog: FC<CollaborateDialogProps> = ({ open, setIsOpen, mindmapId }) => {
  const text = useTranslations("Index");
  const collaboratorText = useTranslations("Collaborator");
  const modalRef = useRef<HTMLDivElement>(null);
  const [addCollaborator, setAddCollaborator] = useState({ mindmapId, userId: "", role: "VIEWER" });
  const [collaborators, setCollaborators] = useState<Collaborator[] | undefined>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  const getUserMindmapById = () => getMindmapById(mindmapId);

  const { isLoading, data: userMindmap } = useQuery<MindMapDetailsProps>("mindmap", getUserMindmapById, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const fetchAddNewCollaborator = useSyncMutation(addNewCollaborator, {
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

  const handleClose = () => {
    // setIsOpen(false);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
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
    setAddCollaborator({ ...addCollaborator, userId: e.target.value });
  };

  const handleCollaboratorRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddCollaborator({ ...addCollaborator, role: e.target.value });
  };

  const handleAddCollaborator = async () => {
    try {
      fetchAddNewCollaborator.mutate(addCollaborator);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }

    setAddCollaborator({ mindmapId, userId: "", role: "" });
  };

  const handleCollaboratorRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, collaboratorId: string) => {
    const updatedCollaborators = userMindmap?.collaborators.map((col) => {
      if (col.collaboratorId === collaboratorId) {
        return { ...col, role: e.target.value };
      }
      return col;
    });

    setCollaborators(updatedCollaborators);
  };

  const handleSave = () => {
    console.log("collaborator:", collaborators);
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
          <p className="text-sm">
            Enable a secret link for collaborators and invite them to create awesome mind maps together.
          </p>
          <div className="flex flex-wrap justify-between w-full mt-4">
            <Input
              value={addCollaborator.userId}
              onChange={handleCollaborator}
              placeholder={`${uppercaseFirstLetter(collaboratorText("addCollaborator"))}`}
              className="py-4 w-fit"
            />
            <select
              className="bg-transparent border-2 rounded-xl text-sm"
              value={addCollaborator.role}
              onChange={(e) => handleCollaboratorRole(e)}
            >
              <option value="ADMIN">{collaboratorText("admin")}</option>
              <option value="CONTRIBUTOR">{collaboratorText("contributor")}</option>
              <option value="VIEWER">{collaboratorText("viewer")}</option>
            </select>
            <Button onClick={handleAddCollaborator}>{uppercaseFirstLetter(text("add"))}</Button>
          </div>
        </article>
        {isLoading ? (
          <>
            <Skeleton className="w-full h-16 bg-slate-600" />
            <Skeleton className="w-full h-16 bg-slate-600" />
          </>
        ) : (
          userMindmap?.collaborators.map((collaborator: Collaborator, i) => (
            <article
              key={collaborator.collaboratorId}
              className="flex items-center justify-between p-4 bg-gray-100 hover:bg-primary-opaque dark:bg-slate-800 hover:dark:bg-slate-600 rounded-xl"
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
                    value={collaborators[i]?.role}
                    onChange={(e) => handleCollaboratorRoleChange(e, collaborator.collaboratorId)}
                  >
                    <option value="ADMIN">{collaboratorText("admin")}</option>
                    <option value="CONTRIBUTOR">{collaboratorText("contributor")}</option>
                    <option value="VIEWER">{collaboratorText("viewer")}</option>
                  </select>
                  {isDeleting ? (
                    <p className="text-xs text-[#ee6a63]">Deleting....</p>
                  ) : (
                    <button
                      onClick={() => handleRemove(collaborator.collaboratorId)}
                      className="text-xs text-[#ee6a63] cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>
      {collaborators?.length != 0 && (
        <section className="flex justify-end">
          <Button onClick={handleSave}>{uppercaseFirstLetter(text("save"))}</Button>
        </section>
      )}
    </div>
  );
};

export { CollaborateDialog };
