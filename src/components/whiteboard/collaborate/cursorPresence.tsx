import type { CursorUpdate as _CursorUpdate } from "@ably/spaces";
import { useCursors } from "@ably/spaces/react";
import { memo } from "react";

import { Cursor } from "./cursor";

type CursorUpdate = Omit<_CursorUpdate, "data"> & {
  data: { state: "move" | "leave" };
};

const Cursors = () => {
  const { cursors } = useCursors({ returnCursors: true });

  if (cursors)
    return (
      <>
        {Object.values(cursors).map((data, index) => {
          if (!data) return;

          const cursorUpdate = data.cursorUpdate as CursorUpdate;
          const { username, userId } = data.member?.profileData as { username: string; userId: string };

          if (cursorUpdate.data.state === "leave") return;

          return (
            <g key={index}>
              <Cursor key={userId} connectionId={index} username={username} position={cursorUpdate.position} />
            </g>
          );
        })}
      </>
    );
};

export const CursorPresence = memo(() => (
  <>
    <Cursors />
  </>
));

CursorPresence.displayName = "CursorPresence";
