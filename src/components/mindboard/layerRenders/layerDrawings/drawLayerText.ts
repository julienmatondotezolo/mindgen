import { Layer } from "@/_types";
import { getContrastingTextColor } from "@/utils/canvasUtils";

export const drawLayerText = ({ layer, context }: { layer: Layer; context: CanvasRenderingContext2D }) => {
  if (layer.value) {
    context.font = `${14}px Arial`;
    context.fillStyle = getContrastingTextColor(layer.fill);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(layer.value, layer.x + layer.width / 2, layer.y + layer.height / 2);
  }
};
