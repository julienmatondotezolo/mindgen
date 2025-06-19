import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

import { Edge, Layer } from "@/_types";
import { edgesAtomState, layerAtomState } from "@/state";
import { mermaidToJson } from "@/utils";

interface DebugEditorProps {
  layers: Layer[];
  edges: Edge[];
}

export const DebugEditor: React.FC<DebugEditorProps> = ({ layers, edges }) => {
  const [mermaidCode, setMermaidCode] = useState("");
  const [jsonCode, setJsonCode] = useState("");
  const setLayers = useSetRecoilState(layerAtomState);
  const setEdges = useSetRecoilState(edgesAtomState);

  useEffect(() => {
    const result = mermaidToJson(mermaidCode);

    if (!result) {
      return;
    }

    // Update JSON code
    setJsonCode(JSON.stringify({ layers: result.layers, edges: result.edges }, null, 2));
  }, [layers, edges, mermaidCode]);

  const handleSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonCode);

      if (parsedData.layers && parsedData.edges) {
        setLayers(parsedData.layers);
        setEdges(parsedData.edges);
      }
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">Debug Editor</h3>
      <div className="flex gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-1">Mermaid Code</h4>
          <textarea
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            className="w-full h-48 p-2 bg-gray-50 dark:bg-gray-950 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs"
          />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold mb-1">JSON State</h4>
          <textarea
            value={jsonCode}
            onChange={(e) => setJsonCode(e.target.value)}
            className="w-full h-48 p-2 bg-gray-50 dark:bg-gray-950 rounded border border-gray-300 dark:border-gray-700 font-mono text-xs"
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
      >
        Update State
      </button>
    </div>
  );
};
