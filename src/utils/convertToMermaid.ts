import { Edge, Layer } from "@/_types";

export function convertToMermaid(layers: Layer[], edges: Edge[]) {
  const idMap = new Map<string, string>();
  let counter = 0;

  const getNextId = () => {
    let id = "";
    let n = counter++;

    do {
      id = String.fromCharCode(65 + (n % 26)) + id;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return id;
  };

  let mermaidChart = "flowchart TD\n";

  layers.forEach((layer) => {
    const charId = getNextId();

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
