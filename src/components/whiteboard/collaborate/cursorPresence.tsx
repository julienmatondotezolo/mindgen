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

  // const exampleUser: ConnectedUser = {
  //   id: "1",
  //   username: "example",
  // };

  useEffect(() => {
    socketListen("connected-users", (data) => {
      setConnectedUsers(data); // Update state instead of ref
    });
  }, [socketListen]);

  return (
    <>
      {connectedUsers.map((connectedUser, index) => (
        <div key={connectedUser.id}>
          <Cursor key={connectedUser.id} connectionId={index} user={connectedUser} />
        </div>
      ))}

      {/* <Cursor connectionId={1} user={exampleUser} /> */}
    </>
  );
};

export const CursorPresence = memo(() => (
  <>
    <Cursors />
  </>
));

CursorPresence.displayName = "CursorPresence";
