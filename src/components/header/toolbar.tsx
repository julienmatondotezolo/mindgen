import Image from "next/image";
import React from "react";
import { useReactFlow } from "reactflow";
import { useRecoilState } from "recoil";

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
import { historyIndexState, historyState } from "@/state";

const ToolBar: React.FC = () => {
  const { setEdges, setNodes, getNodes, getEdges } = useReactFlow();
  const [history, setHistory] = useRecoilState(historyState);
  const [historyIndex, setHistoryIndex] = useRecoilState(historyIndexState);

  const pushToHistory = () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory.slice(0, historyIndex + 1), { nodes: currentNodes, edges: currentEdges }];

      return newHistory;
    });
    setHistoryIndex(historyIndex + 1);
  };

  const undo = () => {
    if (historyIndex < 0) return; // No more history to undo
    setHistoryIndex(historyIndex - 1);
    const { nodes, edges } = history[historyIndex];

    setNodes(nodes);
    setEdges(edges);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return; // No more history to redo
    setHistoryIndex(historyIndex + 1);
    const { nodes, edges } = history[historyIndex + 1];

    setNodes(nodes);
    setEdges(edges);
  };

  const handleDelete = () => {
    setEdges([]);
    setNodes([]);
    pushToHistory();
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    // Set the data for the drag operation
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    pushToHistory();
  };

  const listStyle = "p-2 bg-gray-50 hover:bg-primary-opaque rounded-xl dark:bg-slate-800 hover:dark:bg-slate-600";

  return (
    <div className="flex w-auto px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <button
            onClick={undo}
            className={`${listStyle} cursor-pointer ${historyIndex < 0 ? "opacity-50" : "opacity-100"}`}
            disabled={historyIndex < 0}
          >
            <Image className="rotate-90 -scale-x-100 dark:invert" src={redoIcon} alt="Redo icon" />
          </button>
        </li>
        <li className="m-1">
          <button
            onClick={redo}
            className={`${listStyle} cursor-pointer ${
              historyIndex >= history.length - 1 ? "opacity-50" : "opacity-100"
            }`}
            disabled={historyIndex >= history.length - 1}
          >
            <Image className="-rotate-90 dark:invert" src={redoIcon} alt="Redo icon" />
          </button>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="dark:invert" src={mouseIcon} alt="Mouse icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image
              className="dark:invert"
              onDragStart={(event) => onDragStart(event, "customNode")}
              src={rectangleIcon}
              alt="Rectangle icon"
              draggable
            />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image className="dark:invert" src={tileIcon} alt="Tile icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-move`}>
            <Image
              className="dark:invert"
              onDragStart={(event) => onDragStart(event, "customCircleNode")}
              src={ellipseIcon}
              alt="Ellipse icon"
            />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="dark:invert" src={penIcon} alt="Pen icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="dark:invert" src={eraserIcon} alt="Eraser icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="dark:invert" src={textIcon} alt="Text icon" />
          </div>
        </li>

        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image className="dark:invert" src={imageIcon} alt="Image icon" />
          </div>
        </li>

        <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>

        <li className="m-1">
          <button onClick={handleDelete} className={`${listStyle} cursor-pointer`}>
            <Image src={deleteIcon} width="0" height="0" style={{ width: "100%", height: "auto" }} alt="Delete icon" />
          </button>
        </li>
      </ul>
    </div>
  );
};

export { ToolBar };
