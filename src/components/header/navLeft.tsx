import Image from "next/image";
import React, { useEffect, useState } from "react";

import hamburgerIcon from "@/assets/icons/hamburger.svg";
import { Input } from "@/components/";

function NavLeft({ mindMapName }: { mindMapName: string | undefined }) {
  const listStyle = "p-2 bg-gray-50 rounded-xl hover:bg-gray-200";

  const [newMindMapName, setNewMindMapName] = useState(mindMapName || "");

  useEffect(() => {
    if (mindMapName) setNewMindMapName(mindMapName);
  }, [mindMapName]);

  // Update state when input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMindMapName(e.target.value);
  };

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={hamburgerIcon} alt="Hamburger icon" />
          </div>
        </li>
        <li className="m-1">
          <Input type="text" value={newMindMapName} onChange={handleTitleChange} placeholder="Untitled project" />
        </li>
      </ul>
    </div>
  );
}

export { NavLeft };
