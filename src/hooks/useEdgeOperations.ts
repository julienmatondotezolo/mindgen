import { useRecoilState } from "recoil";

import { edgesAtomState } from "@/state";

export const useEdgeOperations = () => {
  const [edges, setEdges] = useRecoilState(edgesAtomState);

  return {
    edges,
    setEdges,
  };
};
