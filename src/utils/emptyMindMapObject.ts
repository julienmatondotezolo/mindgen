import { Edge, Node, Viewport } from "reactflow";

export function emptyMindMapObject(
  name: string,
  description: string,
  nodes?: Node[],
  edges?: Edge[],
  viewport?: Viewport,
) {
  return {
    name: name,
    description: description,
    nodes: nodes ?? [
      {
        width: 216,
        height: 38,
        id: "node_0",
        type: "mainNode",
        position: {
          x: -60,
          y: 240,
        },
        data: {
          label: "MindGen App",
        },
        style: {
          border: "1px solid",
          borderRadius: 15,
        },
        selected: false,
        dragging: false,
        positionAbsolute: {
          x: -60,
          y: 240,
        },
      },
    ],
    edges: edges ?? [],
    viewport: viewport ?? {
      x: 427.0924760414025,
      y: -151.14134538066662,
      zoom: 0.9167343307636076,
    },
  };
}
