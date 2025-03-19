import { Camera, Layer } from "@/_types";

export const drawLayerText = ({
  layer,
  context,
  camera,
  theme,
}: {
  layer: Layer;
  context: CanvasRenderingContext2D;
  camera: Camera;
  theme: string | undefined;
}) => {
  if (layer.value) {
    context.font = `${14 / camera.scale}px Arial`;
    context.fillStyle = theme === "dark" ? "#ffffff" : "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(layer.value, layer.x + layer.width / 2, layer.y + layer.height / 2);
  }
};
