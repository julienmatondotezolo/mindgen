import { toLower } from "lodash";

import { Edge, Layer } from "@/_types";

export async function exportMindmap(edges: Edge[], layer: Layer[]) {
  try {
    // azerty
    const mindmapObject: any = {};
    const filename = toLower(layer[0].value);

    mindmapObject.edges = edges;
    mindmapObject.layers = layer;

    // Convert the mindmapObject to a JSON string
    const jsonString = JSON.stringify(mindmapObject, null, 2);
    // Create a Blob object from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    // Create a temporary anchor element
    const link = document.createElement("a");
    // Set the href and download attributes of the anchor element

    link.href = url;
    link.download = `${filename}_mindmap.json`;
    // Append the anchor element to the body
    document.body.appendChild(link);

    // Simulate a click on the anchor element
    link.click();
    // Remove the anchor element from the body
    document.body.removeChild(link);
  } catch (error) {
    // Handle any errors that occur while reading the PDF
    console.error("Error downloading file:", error);
    return { message: "Error processing file" };
  }
}
