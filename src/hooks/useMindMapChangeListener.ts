/* eslint-disable no-empty-function */
import { useEffect, useRef } from "react";
import { Edge, Node } from "reactflow";

function useNodeAndEdgeChangeListener(nodes: Node[], edges: Edge[], onChangesDetected: { (): void; (): void }) {
  const previousNodesRef = useRef<Node[]>([]); // Initialize ref for previous nodes
  const previousEdgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    previousNodesRef.current = nodes;
    previousEdgesRef.current = edges;

    const hasChanges =
      JSON.stringify(nodes) !== JSON.stringify(previousNodesRef.current) ||
      JSON.stringify(edges) !== JSON.stringify(previousEdgesRef.current);

    if (hasChanges) {
      onChangesDetected();
    }

    return () => {}; // Cleanup function
  }, [nodes, edges]); // Dependencies
}

export { useNodeAndEdgeChangeListener };
