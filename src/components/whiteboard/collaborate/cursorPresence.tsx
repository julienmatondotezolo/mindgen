import { memo, useEffect, useState } from "react";

import { useSocket } from "@/hooks";

import { Cursor } from "./cursor";

interface ConnectedUser {
  id: string; // Assuming IDs are strings, adjust if necessary
  username: string;
}

const Cursors = () => {
  const { socketListen } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  useEffect(() => {
    socketListen("connected-users", (data) => {
      setConnectedUsers(data); // Update state instead of ref
    });
  }, [socketListen]);

  return (
    <>
      {connectedUsers.map((connectedUser, index) => (
        <g key={connectedUser.id}>
          <Cursor key={connectedUser.id} connectionId={index} user={connectedUser} />
        </g>
      ))}
    </>
  );
};

export const CursorPresence = memo(() => (
  <>
    <Cursors />
  </>
));

CursorPresence.displayName = "CursorPresence";
