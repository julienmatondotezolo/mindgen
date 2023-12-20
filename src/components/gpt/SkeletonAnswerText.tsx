import React from "react";

import { Skeleton } from "../ui/skeleton";

function SkeletonAnswerText() {
  return (
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
  );
}

export { SkeletonAnswerText };
