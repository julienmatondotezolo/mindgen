import { nanoid } from "nanoid";

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

const layerId = nanoid();

export function emptyMindMapObject({
  name,
  description,
  layers = [
    {
      id: layerId.toString() + "0",
      type: LayerType.Rectangle,
      x: 601,
      y: 316,
      width: 200,
      height: 60,
      fill: {
        r: 77,
        g: 106,
        b: 255,
      },
      value: "Text",
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
