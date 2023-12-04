import React from "react";
import Draggable from "react-draggable";

import { Position } from "@/_types";

type NavControlsProps = {
  position: Position;
  setNodes: any;
  setPosition: any;
};

function NavControls({ position, setNodes, setPosition }: NavControlsProps) {
  const addNode = (position: Position) => {
    setNodes((e: any[]) =>
      e.concat({
        id: (e.length + 1).toString(),
        data: { label: `Type something` },
        position: {
          x: position.x ?? Math.random() * window.innerWidth,
          y: position.y ?? Math.random() * window.innerHeight,
        },
      }),
    );
  };

  const handleDrag = (e: any, data: { x: any; y: any }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleStop = () => {
    addNode(position);
    setPosition({ x: 0, y: 0 });
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="absolute top-5 left-5 flex z-10">
      <div className="h-2/3 bg-white rounded-xl shadow-lg">
        <ul className="flex flex-row items-center justify-between h-full">
          <li className="m-2">
            <div className="p-2 bg-gray-50 hover:bg-gray-200 cursor-pointer">
              <Draggable onDrag={handleDrag} onStop={handleStop}>
                <div
                  style={{ transform: `translate(${position})` }}
                  className="w-5 h-5 bg-transparent border-2 border-black rounded-full"
                ></div>
              </Draggable>
            </div>
          </li>

          <li className="m-2">
            <div className="p-2 bg-gray-50 hover:bg-gray-200 cursor-grab">
              <div
                onDragStart={(event) => onDragStart(event, "customNode")}
                className="w-5 h-5 bg-transparent border-2 border-black rounded"
                draggable
              ></div>
            </div>
          </li>

          <li className="m-2">
            <div className="p-2 bg-gray-50 hover:bg-gray-200 cursor-pointer">
              <div className="w-4 h-4 bg-transparent border-2 border-black rotate-45 rounded"></div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavControls;
