/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { updateMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import hamburgerIcon from "@/assets/icons/hamburger.svg";
import { Button, Input, Textarea } from "@/components/";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui";
import { emptyMindMapObject, uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

function NavLeft({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const text = useTranslations("Index");

  const [newMindMapName, setNewMindMapName] = useState("");
  const [newMindMapDescription, setNewMindMapDescription] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const mindMapId = userMindmapDetails?.id;
  const mindMapName = userMindmapDetails?.name;
  const mindMapDescription = userMindmapDetails?.description;

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
  }, [mindMapName, mindMapDescription]);

  // Update state when input changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMindMapName(e.target.value);
  };

  // Update state when input changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMindMapDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Do something with formData

    const newMindmapObject = emptyMindMapObject(
      newMindMapName ?? "",
      newMindMapDescription ?? "",
      userMindmapDetails?.nodes,
      userMindmapDetails?.edges,
    );

    updateMindmapMutation.mutate({
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
                  disabled={updateMindmapMutation.isLoading}
                />
              </section>
              <section>
                <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("description")}</p>
                <Textarea
                  id="description"
                  value={newMindMapDescription}
                  onChange={handleDescriptionChange}
                  placeholder={`${text("untitled")} ${text("description").toLowerCase()}`}
                  disabled={updateMindmapMutation.isLoading}
                />
              </section>
              <div className="flex flex-wrap justify-between items-center">
                <article>
                  <p className="font-semibold">{text("private")}</p>
                  <p className="text-grey dark:text-grey-blue text-sm">{text("onlyViewable")}</p>
                </article>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-primary-color rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-color"></div>
                </label>
              </div>
            </section>
            <Button className="w-full" type="submit" disabled={updateMindmapMutation.isLoading}>
              {updateMindmapMutation.isLoading ? text("loading") : uppercaseFirstLetter(text("save"))}
            </Button>
          </form>
        </ul>
      </SheetContent>
    </Sheet>
  );
}

export { NavLeft };
