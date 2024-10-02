import { memo, useEffect } from "react";

import { useSocket } from "@/hooks";

import { Cursor } from "./cursor";
import { useRecoilState } from "recoil";
import { connectedUsersState } from "@/state";

const Cursors = () => {
  const { socketListen } = useSocket();
  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersState);

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
