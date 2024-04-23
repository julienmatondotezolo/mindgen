import { Edge, Node, Viewport } from "reactflow";

interface MindMapObjectParams {
  name: string;
  description: string;
  pictureUrl?: string;
  nodes?: Node[];
  edges?: Edge[];
  viewport?: Viewport;
}

export function emptyMindMapObject({
  name,
  description,
  pictureUrl,
  nodes = [
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
        selectedByCollaborator: false,
      },
      style: {
        borderRadius: "30px",
        width: 250,
        height: 50,
      },
      selected: false,
      dragging: false,
      positionAbsolute: {
        x: -60,
        y: 240,
      },
    },
  ],
  edges = [],
  viewport = {
    x: 427.0924760414025,
    y: -151.14134538066662,
    zoom: 0.9167343307636076,
  },
}: MindMapObjectParams) {
  return {
    name,
    description,
    pictureUrl,
    nodes,
    edges,
    viewport,
  };
}
