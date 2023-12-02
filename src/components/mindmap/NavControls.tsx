import React from "react";

function NavControls() {
  return (
    <div className="w-12 h-2/3 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-col items-center justify-center h-full">
        <li className="my-2">
          <div className="p-2 bg-gray-50 hover:bg-gray-200 rounded-md cursor-pointer">
            <div className="w-5 h-5 bg-transparent border-2 border-black rounded-full"></div>
          </div>
        </li>

        <li className="my-2">
          <div className="p-2 bg-gray-50 hover:bg-gray-200 rounded-md cursor-pointer">
            <div className="w-5 h-5 bg-transparent border-2 border-black rounded-sm"></div>
          </div>
        </li>

        <li className="my-2">
          <div className="p-2 bg-gray-50 hover:bg-gray-200 rounded-md cursor-pointer">
            <div className="w-5 h-5 bg-transparent border-2 border-black rounded-full"></div>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default NavControls;
