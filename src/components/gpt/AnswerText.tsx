import React from "react";

import { Skeleton } from "../ui/skeleton";

function AnswerText() {
  return (
    <div className="flex flex-row flex-wrap justify-center m-auto w-2/4 mt-36">
      <Skeleton className="h-6 w-96 bg-grey-blue" />
      <div className="w-full mt-8 space-y-6">
        <Skeleton className="h-4 w-48 bg-grey-blue" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-12/12 bg-grey-blue" />
          <Skeleton className="h-4 w-10/12 bg-grey-blue" />
          <Skeleton className="h-4 w-8/12 bg-grey-blue" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-11/12 bg-grey-blue" />
          <Skeleton className="h-4 w-10/12 bg-grey-blue" />
          <Skeleton className="h-4 w-12/12 bg-grey-blue" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-11/12 bg-grey-blue" />
          <Skeleton className="h-4 w-9/12 bg-grey-blue" />
          <Skeleton className="h-4 w-12/12 bg-grey-blue" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-10/12 bg-grey-blue" />
          <Skeleton className="h-4 w-12/12 bg-grey-blue" />
          <Skeleton className="h-4 w-8/12 bg-grey-blue" />
        </div>
      </div>
    </div>
  );
}

export { AnswerText };
