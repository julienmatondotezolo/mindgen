import { Edge, Layer } from "@/_types";

export function convertToMermaid(layers: Layer[], edges: Edge[]) {
  const layerMap: any = {};

  layers.forEach((layer) => {
    layerMap[layer.id] = layer.value;
  });

  // Generate the Mermaid flowchart syntax
  let mermaidChart = "flowchart TD\n";

  mermaidChart += "";

  // Add nodes
  layers.forEach((layer) => {
    mermaidChart += `${layer.id}[${layerMap[layer.id]}]\n`;
  });

  // Add edges
  edges.forEach((edge: Edge) => {
    if (edge.fromLayerId || edge.toLayerId) {
      mermaidChart += `${edge.fromLayerId} --> ${edge.toLayerId}\n`;
    }
  });

  return mermaidChart;
}
