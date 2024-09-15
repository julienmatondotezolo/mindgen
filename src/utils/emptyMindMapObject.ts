import { Edge, Layer, LayerType } from "@/_types";

interface MindMapObjectParams {
  name: string;
  description: string;
  layers?: Layer[];
  edges?: Edge[];
  visibility: string;
  organizationId: string;
  pictureUrl?: string;
}

export function emptyMindMapObject({
  name,
  description,
  layers = [
    {
      id: "node_0",
      type: LayerType.Ellipse,
      x: -60,
      y: 240,
      width: 200,
      height: 60,
      fill: {
        r: 180,
        g: 191,
        b: 204,
      },
      value: "Kevin",
    },
  ],
  edges = [],
  visibility,
  organizationId,
  pictureUrl,
}: MindMapObjectParams) {
  return {
    name,
    description,
    layers,
    edges,
    visibility,
    organizationId,
    pictureUrl,
  };
}
