import { Camera, CanvasMode, CanvasState, Layer } from "@/_types";
import { colorToCss } from "@/utils/canvasUtils";
import { calculateLayerBoundingBox } from "@/utils/layerUtils";

/**
 * Calculates the bounding box for the selection tool
 */
export const calculateSelectionToolBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  // Create an array of all selected layers to calculate the bounding box
  let selectedLayers: Layer[] = allLayers.filter((l) => activeLayers.includes(l.id));

  if (selectedLayers.length === 0) return null;

  // Get the bounding box of selected layers
  const box = calculateLayerBoundingBox(selectedLayers);

  if (!box) return null;

  // Calculate the position of the selection tool UI
  // Center it horizontally and place it 30px above the bounding box
  const toolbarWidth = Math.max(160, 160 / camera.scale); // Width of the selection toolbar
  const toolbarHeight = Math.max(45, 45 / camera.scale); // Height of the selection toolbar
  const toolbarX = box.x + box.width / 2 - toolbarWidth / 2;
  const toolbarY = box.y - toolbarHeight - 80; // 30px above the bounding box

  return {
    x: toolbarX,
    y: toolbarY,
    width: toolbarWidth,
    height: toolbarHeight,
    radius: Math.max(20, 20 / camera.scale),
  };
};

/**
 * Checks if a point is inside the selection tool
 */
export const isPointInSelectionTool = ({
  point,
  allLayers,
  activeLayers,
  camera,
}: {
  point: { x: number; y: number };
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!bounds) return false;

  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

/**
 * Draws the layer selection tool UI above the selected layer's bounding box
 * The UI is centered horizontally and placed 30px above the bounding box
 */
export const drawSelectionTool = ({
  context,
  camera,
  canvasState,
  theme,
  allLayers,
  activeLayers,
}: {
  context: CanvasRenderingContext2D;
  camera: Camera;
  canvasState: CanvasState;
  allLayers: Layer[];
  activeLayers: string[];
  theme: string | undefined;
}): void => {
  if (canvasState.mode === CanvasMode.EdgeDrawing || canvasState.mode === CanvasMode.Translating) return;

  // Create an array of all selected layers to calculate the bounding box
  let selectedLayers: Layer[] = allLayers.filter((l) => activeLayers.includes(l.id));

  if (selectedLayers.length === 0) return;

  // Get the bounding box of selected layers
  const box = calculateLayerBoundingBox(selectedLayers);

  if (!box) return;

  // Get the toolbar bounds
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!bounds) return;

  // Draw the toolbar background with rounded corners
  context.save();

  // Draw toolbar background
  context.fillStyle = theme === "dark" ? "#222" : "#333";
  context.beginPath();
  roundRect(context, bounds.x, bounds.y, bounds.width, bounds.height, bounds.radius);
  context.fill();

  // Add shadow effect
  context.shadowColor = "rgba(0, 0, 0, 0.3)";
  context.shadowBlur = 8;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;

  // Draw divider lines between buttons
  context.fillStyle = theme === "dark" ? "#444" : "#555";
  const firstDividerX = bounds.x + bounds.width / 3;
  const secondDividerX = bounds.x + (bounds.width / 3) * 2;

  // Draw shape button (first section)
  drawShapeIcon(context, bounds.x + bounds.width / 6, bounds.y + bounds.height / 2, theme, camera);

  // Draw the color button (middle section)
  drawColorButton(
    context,
    firstDividerX + bounds.width / 6,
    bounds.y + bounds.height / 2,
    colorToCss(selectedLayers.length > 1 ? selectedLayers[0].fill : { r: 72, g: 105, b: 253 }),
    camera,
  );

  // Draw menu button (last section)
  drawMenuIcon(context, secondDividerX + bounds.width / 6, bounds.y + bounds.height / 2, theme, camera);

  context.restore();
};

/**
 * Helper function to draw rounded rectangles
 */
const roundRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

/**
 * Draws the shape icon in the selection toolbar
 */
const drawShapeIcon = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: string | undefined,
  camera: Camera,
) => {
  const size = Math.max(16, 16 / camera.scale);

  context.strokeStyle = theme === "dark" ? "#fff" : "#fff";
  context.lineWidth = Math.max(2, 2 / camera.scale);

  // Draw a small square icon
  context.beginPath();
  context.rect(x - size / 2, y - size / 2, size, size);
  context.stroke();
};

/**
 * Draws the color button in the selection toolbar
 */
const drawColorButton = (context: CanvasRenderingContext2D, x: number, y: number, color: string, camera: Camera) => {
  const radius = Math.max(10, 10 / camera.scale);

  // Draw color circle
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
};

/**
 * Draws the menu icon (hamburger menu) in the selection toolbar
 */
const drawMenuIcon = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: string | undefined,
  camera: Camera,
) => {
  const width = Math.max(16, 16 / camera.scale);
  let lineGap = Math.max(5, 5 / camera.scale);

  context.strokeStyle = theme === "dark" ? "#fff" : "#fff";
  context.lineWidth = Math.max(1, 1 / camera.scale);

  // Draw three horizontal lines for the hamburger menu
  // Top line
  context.beginPath();
  context.moveTo(x - width / 2, y - lineGap);
  context.lineTo(x + width / 2, y - lineGap);
  context.stroke();

  context.lineWidth = Math.max(1.5, 1.5 / camera.scale);

  // Middle line
  context.beginPath();
  context.moveTo(x - width / 2, y);
  context.lineTo(x + width / 2, y);
  context.stroke();

  context.lineWidth = Math.max(2, 2 / camera.scale);
  lineGap = Math.max(5, 5 / camera.scale);

  // Bottom line
  context.beginPath();
  context.moveTo(x - width / 2, y + lineGap);
  context.lineTo(x + width / 2, y + lineGap);
  context.stroke();
};
