/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { socket } from "@/socket";

const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (socket && socket.connected && isConnected == false) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    if (socket) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    }
  }, []);

  const socketEmit = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const socketListen = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const socketJoinRoom = (roomdId: string | undefined, id: string, user: string) => {
    try {
      socket.emit("join-room", {
        roomId: roomdId,
        username: user,
        userId: id,
      });
    } catch (error) {
      return error;
    }
  };

  const socketLeaveRoom = (roomdId: string | undefined, username: string) => {
    try {
      socket.emit("leave-room", {
        roomId: roomdId,
        username: username,
      });
    } catch (error) {
      return error;
    }
  };

  const socketOff = (event: string) => {
    socket.off(event);
  };

  // Handle navigation changes
  useEffect(() => {
    const handlePopState = () => {
      socketOff("cursor-move"); // Optionally close the WebSocket connection on navigation change
    };

    window.addEventListener("popstate", handlePopState);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Add a listener for the beforeunload event to close the WebSocket connection
  useEffect(() => {
    const handleBeforeUnload = () => {
      socketOff("cursor-move"); // Close the WebSocket connection
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socketOff]);

  return { socket, isConnected, socketEmit, socketListen, socketJoinRoom, socketLeaveRoom, socketOff };
};

export { useSocket };
