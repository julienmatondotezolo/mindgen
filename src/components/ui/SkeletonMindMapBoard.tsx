import React from "react";

import { Skeleton } from "./skeleton";

function SkeletonMindMapBoard() {
  return (
    <section className="flex flex-wrap flex-col w-full mr-4">
      <Skeleton className="h-24 w-full rounded-xl mb-4 bg-grey-blue" />
      <article className=" space-y-2">
        <Skeleton className="h-3 w-28 bg-grey-blue" />
        <Skeleton className="h-2 w-36 bg-grey-blue" />
        <Skeleton className="h-2 w-24 bg-grey-blue" />
      </article>
    </section>
  );
}

export { SkeletonMindMapBoard };
