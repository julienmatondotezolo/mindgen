import { Edge, Node } from "reactflow";

export function convertToNestedArray(nodes: Node[], edges: Edge[]) {
  const nodeMap = new Map(nodes.map((node: Node) => [node.id, node.data.label]));
  const adjacencyList = new Map();

  edges.forEach((edge: Edge) => {
    const sourceLabel = nodeMap.get(edge.source);
    const targetLabel = nodeMap.get(edge.target);

    if (!adjacencyList.has(sourceLabel)) {
      adjacencyList.set(sourceLabel, []);
    }

    adjacencyList.get(sourceLabel).push(targetLabel);
  });

  const buildNestedArray = (label: String) => {
    const children = adjacencyList.get(label);

    if (!children || children.length === 0) {
      return `"${label}"`;
    }

    const nestedChildren = children.map(buildNestedArray);

    return `["${label}", [${nestedChildren.join(", ")}]]`;
  };

  const rootLabel = nodeMap.get(nodes[0].id);

  console.log("Edge:", edges);
  console.log("Nested nested created");
  return buildNestedArray(rootLabel);
}
