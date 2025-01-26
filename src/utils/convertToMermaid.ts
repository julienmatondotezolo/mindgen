import { Edge, Layer } from "@/_types";

export function convertToMermaid(layers: Layer[], edges: Edge[]) {
  const idMap = new Map<string, string>();
  let currentCharCode = 65;
  const maxSingleChar = 90; 

  let mermaidChart = "flowchart TD\n";

  layers.forEach((layer) => {
    let charId;
    if (currentCharCode <= maxSingleChar) {
      charId = String.fromCharCode(currentCharCode++);
    } else {
      const firstChar = String.fromCharCode(65 + Math.floor((currentCharCode - 65) / 26));
      const secondChar = String.fromCharCode(65 + ((currentCharCode - 65) % 26));
      charId = firstChar + secondChar;
      currentCharCode++;
    }
    idMap.set(layer.id, charId);
    mermaidChart += `${charId}[${layer.value}]\n`;
  });

  edges.forEach((edge) => {
    if (edge.fromLayerId && edge.toLayerId) {
      const from = idMap.get(edge.fromLayerId);
      const to = idMap.get(edge.toLayerId);
      if (from && to) {
        mermaidChart += `${from}-->${to}\n`;
      }
    }
  });

  return mermaidChart;
}
