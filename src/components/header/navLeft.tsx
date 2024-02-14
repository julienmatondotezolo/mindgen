/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { updateMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import hamburgerIcon from "@/assets/icons/hamburger.svg";
import { Button, Input, Textarea } from "@/components/";
import { emptyMindMapObject } from "@/utils";

function NavLeft({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const [newMindMapName, setNewMindMapName] = useState("");
  const [newMindMapDescription, setNewMindMapDescription] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mindMapId = userMindmapDetails?.id;
  const mindMapName = userMindmapDetails?.name;
  const mindMapDescription = userMindmapDetails?.description;

  mindMapName;

  const listStyle = "p-2 bg-gray-50 rounded-xl hover:bg-gray-200 dark:bg-slate-700 hover:dark:bg-slate-600";

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

    console.log("newMindmapObject:", JSON.stringify(newMindmapObject));

    const response = await updateMindmapById(mindMapId, newMindmapObject);

    console.log("response:", response);
  };

  return (
    <>
      <div className="flex px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-700">
        <ul className="flex flex-row items-center justify-between">
          <li className="m-1">
            <div className={`${listStyle} cursor-pointer`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Image className="dark:invert" src={hamburgerIcon} alt="Hamburger icon" />
            </div>
          </li>
          <li className="m-1">
            <a href={`/dashboard`}>
              <figure className=" mr-8">
                <p className="font-bold text-base dark:text-white">
                  MIND<span className="text-primary-color">GEN</span>
                </p>
              </figure>
            </a>
          </li>
        </ul>
      </div>
      {isMenuOpen && (
        <ul className="fixed space-x-10 sm:w-1/2 md:w-72 left-0 top-16 p-6 bg-white z-50 rounded-xl shadow-xl">
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">
              Name:
              <Input
                id="name"
                type="text"
                value={newMindMapName}
                onChange={handleNameChange}
                placeholder="Untitled project"
              />
            </label>
            <label htmlFor="name">
              Description:
              <Textarea
                id="description"
                value={newMindMapDescription}
                onChange={handleDescriptionChange}
                placeholder="Untitled project description"
              />
            </label>
            <Button className="w-full" type="submit">
              Save
            </Button>
          </form>
        </ul>
      )}
    </>
  );
}

export { NavLeft };
