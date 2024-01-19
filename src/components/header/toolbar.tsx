import Image from "next/image";
import React from "react";

import deleteIcon from "@/assets/icons/delete.svg";
import ellipseIcon from "@/assets/icons/ellipse.svg";
import eraserIcon from "@/assets/icons/eraser.svg";
import imageIcon from "@/assets/icons/image.svg";
import mouseIcon from "@/assets/icons/mouse.svg";
import penIcon from "@/assets/icons/pen.svg";
import rectangleIcon from "@/assets/icons/rectangle.svg";
import redoIcon from "@/assets/icons/redo.svg";
import textIcon from "@/assets/icons/text.svg";
import tileIcon from "@/assets/icons/tile.svg";

function ToolBar() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const listStyle = "p-2 bg-gray-50 hover:bg-primary-opaque rounded-xl";

  return (
    <div className="flex w-auto px-1 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="rotate-90 -scale-x-100" src={redoIcon} alt="Redo icon" />
          </div>
        </li>
        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="-rotate-90" src={redoIcon} alt="Redo icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={mouseIcon} alt="Mouse icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image
              onDragStart={(event) => onDragStart(event, "customNode")}
              src={rectangleIcon}
              alt="Rectangle icon"
              draggable
            />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image src={tileIcon} alt="Tile icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image src={ellipseIcon} alt="Ellipse icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={penIcon} alt="Pen icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={eraserIcon} alt="Eraser icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={textIcon} alt="Text icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={imageIcon} alt="Image icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={deleteIcon} width="0" height="0" style={{ width: "100%", height: "auto" }} alt="Delete icon" />
          </div>
        </li>
      </ul>
    </div>
  );
}

export { ToolBar };
