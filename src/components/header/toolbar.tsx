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
  const size = 15;
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const listStyle = "p-2 bg-gray-50 rounded-xl hover:bg-gray-200";

  return (
    <div className="w-auto bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="rotate-90 -scale-x-100" src={redoIcon} height={size} width={size} alt="Redo icon" />
          </div>
        </li>
        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="-rotate-90" src={redoIcon} height={size} width={size} alt="Redo icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={mouseIcon} height={size} width={size} alt="Mouse icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image
              onDragStart={(event) => onDragStart(event, "customNode")}
              src={rectangleIcon}
              height={size * 1.2}
              width={size * 1.2}
              alt="Rectangle icon"
              draggable
            />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image src={tileIcon} height={size * 1.3} width={size * 1.3} alt="Tile icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image src={ellipseIcon} height={size * 1.2} width={size * 1.2} alt="Ellipse icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={penIcon} height={size * 1.1} width={size * 1.1} alt="Pen icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={eraserIcon} height={size * 1.2} width={size * 1.2} alt="Eraser icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={textIcon} height={size} width={size} alt="Text icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={imageIcon} height={size * 1.1} width={size * 1.1} alt="Image icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={deleteIcon} height={size / 1.1} width={size} alt="Delete icon" />
          </div>
        </li>
      </ul>
    </div>
  );
}

export default ToolBar;
