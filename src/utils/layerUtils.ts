import { Layer, Point } from "@/_types";

export const getLayerById = ({ layerId, layers }: { layerId: string; layers: Layer[] }): Layer =>
  layers.filter((layer: Layer) => layer.id == layerId)[0];

export function findIntersectingLayersWithRectangle(layers: Layer[], a: Point, b: Point) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = new Set<string>();

  for (const layer of layers) {
    if (layer == null) {
      continue;
    }

    const { x, y, height, width } = layer;

    if (rect.x + rect.width > x && rect.x < x + width && rect.y + rect.height > y && rect.y < y + height) {
      ids.add(layer.id); // Set automatically handles duplicates
    }
  }

  return Array.from(ids);
}
