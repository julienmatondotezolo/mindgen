/* eslint-disable no-unused-vars */
import { toLower } from "lodash";

import { Edge, Layer } from "@/_types";

export async function exportMindmap(edges: Edge[], layers: Layer[]) {
  try {
    // Remove the dbId property from each layer & edges
    const sanitizedEdges = edges.map((edge) => {
      const { dbId, ...rest } = edge as Edge & { dbId?: string };

      return rest;
    });

    const sanitizedLayers = layers.map((layer) => {
      const { dbId, ...rest } = layer as Layer & { dbId?: string };

      return rest;
    });

    const mindmapObject: any = {
      edges: sanitizedEdges,
      layers: sanitizedLayers, // Use the sanitized layers
    };

    const filename = toLower(sanitizedLayers[0].value || "mindmap");

    const jsonString = JSON.stringify(mindmapObject, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    // Use the fetch API to trigger the download
    const url = URL.createObjectURL(blob);

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.style.display = "none";
        a.href = url;
        a.download = `${filename}_mindmap.json`;

        // Append to the document to make it work in Firefox
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((err) => console.error("Error downloading file:", err));
  } catch (error) {
    console.error("Error downloading file:", error);
    return { message: "Error processing file" };
  }
}
