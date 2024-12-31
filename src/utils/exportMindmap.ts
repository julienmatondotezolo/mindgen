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

    // Use the fetch API to trigger the download
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        // Create a temporary anchor element
        const a = document.createElement("a");

        a.style.display = "none";
        // Set the href and download attributes of the anchor element
        a.href = url;
        a.download = filename;

        // Append to the document to make it work in Firefox
        // Append the anchor element to the body
        document.body.appendChild(a);

        // Simulate a click on the anchor element
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);

        // Remove the anchor element from the body
        document.body.removeChild(a);
      })
      .catch((err) => console.error("Error downloading file:", err));
  } catch (error) {
    // Handle any errors that occur while reading the PDF
    console.error("Error downloading file:", error);
    return { message: "Error processing file" };
  }
}
