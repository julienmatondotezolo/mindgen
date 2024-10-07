import { memo, useEffect } from "react";
import { useRecoilState } from "recoil";

import { useSocket } from "@/hooks";
import { connectedUsersState } from "@/state";

import { Cursor } from "./cursor";

const Cursors = () => {
  const { socketListen } = useSocket();
  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersState);

  useEffect(() => {
    socketListen("connected-users", (data) => {
      setConnectedUsers(data); // Update state instead of ref
    });
  }, [setConnectedUsers, socketListen]);

  return (
    <>
      {connectedUsers.map((connectedUser, index) => (
        <g key={index}>
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
