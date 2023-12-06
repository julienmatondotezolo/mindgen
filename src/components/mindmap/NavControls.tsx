import React from "react";

function NavControls() {
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
              <div className="w-5 h-5 bg-transparent border-2 border-black rounded-full"></div>
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
