import { useRecoilValue } from "recoil";

import { lockedAtomState } from "@/state";

export const useLocks = () => {
  const lockedElements = useRecoilValue(lockedAtomState);

  // Verify if a layer is locked
  const checkIfLayerIsLocked = (layerId: string) =>
    lockedElements.some((lockedElement) => lockedElement.lockedLayers.includes(layerId));

  // Verify if an edge is locked
  const checkIfEdgeIsLocked = (edgeId: string) =>
    lockedElements.some((lockedElement) => lockedElement.lockedEdges.includes(edgeId));

  return {
    checkIfLayerIsLocked,
    checkIfEdgeIsLocked,
  };
};
