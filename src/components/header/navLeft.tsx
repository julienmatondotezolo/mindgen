/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";

import { updateMindmapById } from "@/_services";
import { CustomSession, MindMapDetailsProps, Organization } from "@/_types";
import hamburgerIcon from "@/assets/icons/hamburger.svg";
import { Button, Input, Textarea } from "@/components/";
import { Sheet, SheetContent, SheetTrigger, Switch } from "@/components/ui";
import { selectedOrganizationState } from "@/state";
import { checkPermission, emptyMindMapObject, uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

function NavLeft({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const session = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const text = useTranslations("Index");

  const PERMISSIONS = userMindmapDetails?.connectedCollaboratorPermissions;

  const [newMindMapName, setNewMindMapName] = useState("");
  const [newMindMapDescription, setNewMindMapDescription] = useState("");
  const [newMindMapVisibility, setNewMindMapVisibility] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const mindMapId = userMindmapDetails?.id;
  const mindMapName = userMindmapDetails?.name;
  const mindMapDescription = userMindmapDetails?.description;
  const mindMapVisibility = userMindmapDetails?.visibility;

  const listStyle = "p-2 bg-gray-50 rounded-xl hover:bg-gray-200 dark:bg-slate-800 hover:dark:bg-slate-600";

  const queryClient = useQueryClient();
  // Define the mutation
  const updateMindmapMutation = useMutation(updateMindmapById, {
    onSuccess: () => {
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("mindmaps");
      setIsSheetOpen(false);
    },
  });

  useEffect(() => {
    if (mindMapName) setNewMindMapName(mindMapName);
    if (mindMapDescription) setNewMindMapDescription(mindMapDescription);
    if (mindMapVisibility) setNewMindMapVisibility(mindMapVisibility);
  }, [mindMapName, mindMapDescription, mindMapVisibility]);

  // Update state when input changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMindMapName(e.target.value);
  };

  // Update state when input changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMindMapDescription(e.target.value);
  };

  const handleVisibilityChange = (checked: boolean) => {
    setNewMindMapVisibility(checked ? "PRIVATE" : "PUBLIC");
  };

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Do something with formData

    const newMindmapObject = emptyMindMapObject({
      name: newMindMapName ?? "",
      description: newMindMapDescription ?? "",
      layers: userMindmapDetails?.layers,
      edges: userMindmapDetails?.edges,
      organizationId: selectedOrga!.id,
      visibility: newMindMapVisibility ?? "PRIVATE",
    });

    updateMindmapMutation.mutate({
      session: safeSession,
      mindmapId: mindMapId,
      mindmapObject: newMindmapObject,
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={() => setIsSheetOpen(!isSheetOpen)}>
      <div className="flex px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
        <ul className="flex flex-row items-center justify-between px-1">
          <li className="flex mr-4">
            <SheetTrigger>
              <div className={`${listStyle} cursor-pointer`}>
                <Image className="dark:invert" src={hamburgerIcon} alt="Hamburger icon" />
              </div>
            </SheetTrigger>
          </li>
          <li>
            <Link href={`/dashboard`}>
              <figure>
                <p className="font-bold text-base dark:text-white">
                  MIND<span className="text-primary-color">GEN</span>
                </p>
              </figure>
            </Link>
          </li>
        </ul>
      </div>
      <SheetContent side="left" className="rounded-r-2xl shadow-xl bg-white dark:border-slate-800 dark:bg-slate-900">
        <ul className="w-full h-full">
          <form className="h-full flex flex-col justify-between pt-4" onSubmit={handleSubmit}>
            <section className="space-y-4">
              <p className="font-bold text-xl">{uppercaseFirstLetter(text("save"))} mind map</p>
              <section>
                <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("name")}</p>
                <Input
                  id="name"
                  type="text"
                  value={newMindMapName}
                  onChange={handleNameChange}
                  placeholder={`${text("untitled")} ${text("name").toLowerCase()}`}
                  disabled={updateMindmapMutation.isLoading || !checkPermission(PERMISSIONS, "UPDATE")}
                />
              </section>
              <section>
                <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("description")}</p>
                <Textarea
                  id="description"
                  value={newMindMapDescription}
                  className=" h-[100px]"
                  onChange={handleDescriptionChange}
                  placeholder={`${text("untitled")} ${text("description").toLowerCase()}`}
                  disabled={updateMindmapMutation.isLoading || !checkPermission(PERMISSIONS, "UPDATE")}
                />
              </section>
              <div className="flex flex-wrap justify-between items-center">
                <article>
                  <p className="font-semibold">{text("private")}</p>
                  <p className="text-grey dark:text-grey-blue text-sm">{text("onlyViewable")}</p>
                </article>
                <Switch
                  checked={newMindMapVisibility == "PRIVATE" ? true : false}
                  onCheckedChange={handleVisibilityChange}
                  disabled={!checkPermission(PERMISSIONS, "UPDATE")}
                />
              </div>
            </section>
            {checkPermission(PERMISSIONS, "UPDATE") && (
              <Button className="w-full" type="submit" disabled={updateMindmapMutation.isLoading}>
                {updateMindmapMutation.isLoading ? text("loading") : uppercaseFirstLetter(text("save"))}
              </Button>
            )}
          </form>
        </ul>
      </SheetContent>
    </Sheet>
  );
}

export { NavLeft };
