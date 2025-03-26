import { useEffect } from "react";
import { useQueryClient } from "react-query";
import { useSetRecoilState } from "recoil";

import { BoardDataProps } from "@/_types/BoardDataProps";
import { edgesAtomState, layerAtomState } from "@/state";

/**
 * A custom hook that listens for changes to the board query cache
 * and updates the Recoil state for layers and edges.
 *
 * @param boardId The ID of the board to listen for changes
 */
export const useBoardRefresh = ({ boardId }: { boardId: string }) => {
  const queryClient = useQueryClient();
  const setLayers = useSetRecoilState(layerAtomState);
  const setEdges = useSetRecoilState(edgesAtomState);

  useEffect(() => {
    // Function to update state from cache
    const updateStateFromCache = () => {
      // Get the current data from the query cache
      const boardData = queryClient.getQueryData<BoardDataProps>(["board", boardId]);

      if (boardData) {
        // Update the layers and edges Recoil state
        setLayers(boardData.layers);
        setEdges(boardData.edges);
      }
    };

    // Create a handler that we'll pass to the subscription
    const handleQueryCacheChange = () => {
      updateStateFromCache();
    };

    // Set up cache listeners to detect any changes
    const unsubscribe = queryClient.getQueryCache().subscribe(handleQueryCacheChange);

    // Run once on mount to ensure initial state is set
    updateStateFromCache();

    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, [boardId, queryClient, setLayers, setEdges]);
};
