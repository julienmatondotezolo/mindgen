import React from "react";

import { Skeleton } from "../ui/skeleton";

function MindMapBoards() {
  if (true)
    return Array.from({ length: 3 }).map((_, index) => (
      <section key={index} className="fle flex-wrap flex-col w-56">
        <Skeleton className="h-24 w-full rounded-xl mb-4 bg-grey-blue" />
        <article className=" space-y-2">
          <Skeleton className="h-3 w-28 bg-grey-blue" />
          <Skeleton className="h-2 w-36 bg-grey-blue" />
          <Skeleton className="h-2 w-24 bg-grey-blue" />
        </article>
      </section>
    ));

  // return (
  //   <div className="float-left mr-4">
  //     <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
  //     <article>
  //       <p className="text-sm font-medium">Test mind map</p>
  //       <p className="text-xs text-primary-color">Created by mindgen</p>
  //       <p className="text-xs text-primary-color">Dec 1, 2023</p>
  //     </article>
  //   </div>
  // );
}

export { MindMapBoards };
