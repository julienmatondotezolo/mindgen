import { Camera, CanvasMode, CanvasState, Edge, EdgeShape, Layer, LayerBorderType, Point } from "@/_types";
import { COLORS, colorToCss } from "@/utils/canvasUtils";
import { calculateEdgeBoundingBox, calculateLayerBoundingBox } from "@/utils/layerUtils";

/**
 * Calculates the bounding box for the selection tool
 */
export const calculateSelectionToolBounds = ({
  allLayers,
  activeLayers,
  allEdges,
  activeEdges,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  allEdges?: Edge[];
  activeEdges?: string[];
  camera: Camera;
}) => {
  // Create an array of all selected layers to calculate the bounding box
  let selectedLayers: Layer[] = allLayers.filter((l) => activeLayers.includes(l.id));
  // Create an array of all selected edges to calculate the bounding box
  let selectedEdges: Edge[] = allEdges?.filter((e) => activeEdges?.includes(e.id)) ?? [];

  if (selectedLayers.length === 0 && selectedEdges.length === 0) return null;

  // Get the bounding box of selected layers
  let box;
  let width = 160;

  if (selectedLayers.length > 0) {
    box = calculateLayerBoundingBox(selectedLayers);
    width = 53.3333333333 * 3;
  }

  if (selectedEdges.length > 0) {
    box = calculateEdgeBoundingBox(selectedEdges);
    width = 53.3333333333 * 5;
  }

  if (!box) return null;

  // Calculate the position of the selection tool UI
  // Center it horizontally and place it 45px above the bounding box
  const toolbarWidth = Math.max(width, width / camera.scale); // Width of the selection toolbar
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
 * Calculates the bounding box for the color palette that appears when toolingModeState is LAYER_COLOR
 */
export const calculateColorPaletteBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const toolbarBounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!toolbarBounds) return null;

  const paletteWidth = toolbarBounds.width;
  const paletteHeight = Math.max(80, 80 / camera.scale);
  const paletteX = toolbarBounds.x;
  const paletteY = toolbarBounds.y - toolbarBounds.height - Math.max(40, 40 / camera.scale); // 10px below toolbar

  return {
    x: paletteX,
    y: paletteY,
    width: paletteWidth,
    height: paletteHeight,
    radius: toolbarBounds.radius,
  };
};

/**
 * Calculates the bounding box for the border style that appears when toolingModeState is LAYER_BORDER
 */
export const calculateBorderStyleBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const toolbarBounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!toolbarBounds) return null;

  const borderToolbarWidth = toolbarBounds.width;
  const borderToolbarHeight = Math.max(40, 40 / camera.scale);
  const borderToolbarX = toolbarBounds.x;
  const borderToolbarY = toolbarBounds.y - toolbarBounds.height - Math.max(1, 1 / camera.scale); // 10px below toolbar

  return {
    x: borderToolbarX,
    y: borderToolbarY,
    width: borderToolbarWidth,
    height: borderToolbarHeight,
    radius: toolbarBounds.radius,
  };
};

/**
 * Calculates the positions and bounds for each color circle in the color palette
 */
export const calculateColorCirclesBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const paletteBounds = calculateColorPaletteBounds({ allLayers, activeLayers, camera });

  if (!paletteBounds) return null;

  const colorCircleRadius = Math.max(12, 12 / camera.scale);
  const totalColors = COLORS.length;

  // Calculate how many colors can fit in a row with proper spacing
  const colorsPerRow = Math.min(totalColors, 5); // Maximum 5 colors per row
  const rows = Math.ceil(totalColors / colorsPerRow);

  // Calculate horizontal and vertical spacing
  const horizontalSpacing = paletteBounds.width / (colorsPerRow + 1);
  const verticalSpacing = paletteBounds.height / (rows + 1);

  return COLORS.map((color, index) => {
    const row = Math.floor(index / colorsPerRow);
    const col = index % colorsPerRow;

    const x = paletteBounds.x + horizontalSpacing * (col + 1);
    const y = paletteBounds.y + verticalSpacing * (row + 1);

    return {
      color,
      x,
      y,
      radius: colorCircleRadius,
    };
  });
};

/**
 * Calculates the bounding box for the shape icon section
 */
export const calculateTextIconBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!bounds) return null;

  // First section of the toolbar (left third)
  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width / 3,
    height: bounds.height,
  };
};

/**
 * Calculates the bounding box for the color button section
 */
export const calculateColorButtonBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!bounds) return null;

  // Middle section of the toolbar (middle third)
  return {
    x: bounds.x + bounds.width / 3,
    y: bounds.y,
    width: bounds.width / 3,
    height: bounds.height,
  };
};

/**
 * Calculates the bounding box for the menu icon section
 */
export const calculateMenuIconBounds = ({
  allLayers,
  activeLayers,
  camera,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, camera });

  if (!bounds) return null;

  // Last section of the toolbar (right third)
  return {
    x: bounds.x + (bounds.width / 3) * 2,
    y: bounds.y,
    width: bounds.width / 3,
    height: bounds.height,
  };
};

/**
 * Calculates the bounding box for the border icon section
 */
export const calculateBorderIconBounds = ({
  allLayers,
  activeLayers,
  camera,
  section,
}: {
  allLayers: Layer[];
  activeLayers: string[];
  camera: Camera;
  section: "left" | "middle" | "right";
}) => {
  const bounds = calculateBorderStyleBounds({ allLayers, activeLayers, camera });

  if (!bounds) return null;

  let boundsXPosition = bounds.x;

  switch (section) {
    case "left":
      boundsXPosition = bounds.x;
      break;
    case "middle":
      boundsXPosition = bounds.x + bounds.width / 3;
      break;
    case "right":
      boundsXPosition = bounds.x + (bounds.width / 3) * 2;
      break;
    default:
      break;
  }

  // First section of the toolbar (left third)
  return {
    x: boundsXPosition,
    y: bounds.y,
    width: bounds.width / 3,
    height: bounds.height,
  };
};

/**
 * Calculates the bounding box for the spline icon section
 */
export const calculateSplineIconBounds = ({
  allEdges,
  activeEdges,
  camera,
}: {
  allEdges: Edge[] | undefined;
  activeEdges: string[] | undefined;
  camera: Camera;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers: [], activeLayers: [], allEdges, activeEdges, camera });

  if (!bounds) return null;

  // Position the bounds at approximately 71% from the left edge (matching the draw position)
  return {
    x: bounds.x + bounds.width / 1.2 - bounds.width / 6,
    y: bounds.y,
    width: bounds.width / 10,
    height: bounds.height,
  };
};

/**
 * Calculates the bounding box for the arrow icon section
 */
export const calculateArrowIconBounds = ({
  allEdges,
  activeEdges,
  camera,
}: {
  allEdges: Edge[] | undefined;
  activeEdges: string[] | undefined;
  camera: Camera;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers: [], activeLayers: [], allEdges, activeEdges, camera });

  if (!bounds) return null;

  // Position the bounds at approximately 71% from the left edge (matching the draw position)
  return {
    x: bounds.x + bounds.width - bounds.width / 6,
    y: bounds.y,
    width: bounds.width / 10,
    height: bounds.height,
  };
};

/**
 * Checks if a point is inside the selection tool
 * Returns an object with isInSelectionTool and toolingMode based on which section the point is in
 */
export const isPointInSelectionTool = ({
  point,
  allLayers,
  activeLayers,
  allEdges,
  activeEdges,
  camera,
  canvasState,
}: {
  point: Point;
  allLayers: Layer[];
  activeLayers: string[];
  allEdges?: Edge[];
  activeEdges?: string[];
  camera: Camera;
  canvasState?: CanvasState;
}) => {
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, allEdges, activeEdges, camera });
  const borderStyleBounds = calculateBorderStyleBounds({ allLayers, activeLayers, camera });

  if (!bounds) return { isInSelectionTool: false };

  // Check if we're in LAYER_COLOR mode and if the point is in the color palette
  if (canvasState && "toolingModeState" in canvasState && canvasState.toolingModeState === "LAYER_COLOR") {
    const colorCircles = calculateColorCirclesBounds({ allLayers, activeLayers, camera });

    if (colorCircles) {
      // Check if the point is inside any color circle
      for (const circle of colorCircles) {
        const distance = Math.sqrt(Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2));

        if (distance <= circle.radius) {
          return {
            isInSelectionTool: true,
            toolingMode: "LAYER_COLOR" as const,
            toolingModeColor: circle.color,
            toolingModeBorderWidth: undefined,
            toolingModeBorderType: undefined,
          };
        }
      }

      // Check if the point is in the color palette but not on any circle
      const paletteBounds = calculateColorPaletteBounds({ allLayers, activeLayers, camera });

      if (
        paletteBounds &&
        point.x >= paletteBounds.x &&
        point.x <= paletteBounds.x + paletteBounds.width &&
        point.y >= paletteBounds.y &&
        point.y <= paletteBounds.y + paletteBounds.height
      ) {
        return {
          isInSelectionTool: true,
          toolingMode: "LAYER_COLOR" as const,
          toolingModeBorderWidth: undefined,
          toolingModeBorderType: undefined,
        };
      }
    }
  }

  // Check if point is in overall selection tool bounds
  const isInBounds =
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height;

  const isInBorderStyleBounds =
    borderStyleBounds &&
    point.x >= borderStyleBounds.x &&
    point.x <= borderStyleBounds.x + borderStyleBounds.width &&
    point.y >= borderStyleBounds.y &&
    point.y <= borderStyleBounds.y + borderStyleBounds.height;

  if (!isInBounds && !isInBorderStyleBounds) return { isInSelectionTool: false };

  // Check which section the point is in
  const shapeIconBounds = calculateTextIconBounds({ allLayers, activeLayers, camera });
  const colorButtonBounds = calculateColorButtonBounds({ allLayers, activeLayers, camera });
  const menuIconBounds = calculateMenuIconBounds({ allLayers, activeLayers, camera });
  const splineIconBounds = calculateSplineIconBounds({ allEdges, activeEdges, camera });
  const arrowIconBounds = calculateArrowIconBounds({ allEdges, activeEdges, camera });

  const leftBorderIconBounds = calculateBorderIconBounds({ allLayers, activeLayers, camera, section: "left" });
  const middleBorderIconBounds = calculateBorderIconBounds({ allLayers, activeLayers, camera, section: "middle" });
  const rightBorderIconBounds = calculateBorderIconBounds({ allLayers, activeLayers, camera, section: "right" });

  if (
    shapeIconBounds &&
    point.x >= shapeIconBounds.x &&
    point.x <= shapeIconBounds.x + shapeIconBounds.width &&
    point.y >= shapeIconBounds.y &&
    point.y <= shapeIconBounds.y + shapeIconBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "LAYER_SHAPE" as const,
      toolingModeBorderWidth: undefined,
      toolingModeBorderType: undefined,
    };
  }

  if (
    colorButtonBounds &&
    point.x >= colorButtonBounds.x &&
    point.x <= colorButtonBounds.x + colorButtonBounds.width &&
    point.y >= colorButtonBounds.y &&
    point.y <= colorButtonBounds.y + colorButtonBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "LAYER_COLOR" as const,
      toolingModeBorderWidth: undefined,
      toolingModeBorderType: undefined,
    };
  }

  if (
    menuIconBounds &&
    point.x >= menuIconBounds.x &&
    point.x <= menuIconBounds.x + menuIconBounds.width &&
    point.y >= menuIconBounds.y &&
    point.y <= menuIconBounds.y + menuIconBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "LAYER_BORDER" as const,
      toolingModeBorderWidth: undefined,
      toolingModeBorderType: undefined,
    };
  }

  if (
    leftBorderIconBounds &&
    point.x >= leftBorderIconBounds.x &&
    point.x <= leftBorderIconBounds.x + leftBorderIconBounds.width &&
    point.y >= leftBorderIconBounds.y &&
    point.y <= leftBorderIconBounds.y + leftBorderIconBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "LAYER_BORDER" as const,
      toolingModeBorderWidth: 2,
      toolingModeBorderType: undefined,
      toolingModeColor: undefined,
    };
  }

  if (
    middleBorderIconBounds &&
    point.x >= middleBorderIconBounds.x &&
    point.x <= middleBorderIconBounds.x + middleBorderIconBounds.width &&
    point.y >= middleBorderIconBounds.y &&
    point.y <= middleBorderIconBounds.y + middleBorderIconBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "LAYER_BORDER" as const,
      toolingModeBorderWidth: 4,
      toolingModeBorderType: undefined,
      toolingModeColor: undefined,
    };
  }

  if (
    rightBorderIconBounds &&
    point.x >= rightBorderIconBounds.x &&
    point.x <= rightBorderIconBounds.x + rightBorderIconBounds.width &&
    point.y >= rightBorderIconBounds.y &&
    point.y <= rightBorderIconBounds.y + rightBorderIconBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "LAYER_BORDER" as const,
      toolingModeBorderType: "DASHED" as LayerBorderType,
      toolingModeColor: undefined,
    };
  }

  if (
    splineIconBounds &&
    point.x >= splineIconBounds.x &&
    point.x <= splineIconBounds.x + splineIconBounds.width &&
    point.y >= splineIconBounds.y &&
    point.y <= splineIconBounds.y + splineIconBounds.height
  ) {
    let selectedEdges = allEdges?.filter((e) => activeEdges?.includes(e.id));

    // Return shape conditionally based on the current shape
    const newShape =
      selectedEdges && selectedEdges.length > 0
        ? selectedEdges[0].shape === EdgeShape.Curved
          ? EdgeShape.SmoothStep
          : selectedEdges[0].shape === EdgeShape.SmoothStep
            ? EdgeShape.Line
            : EdgeShape.Curved
        : EdgeShape.Curved;

    return {
      isInSelectionTool: true,
      toolingMode: "EDGE_SHAPE" as const,
      toolingModeShape: newShape,
    };
  }

  if (
    arrowIconBounds &&
    point.x >= arrowIconBounds.x &&
    point.x <= arrowIconBounds.x + arrowIconBounds.width &&
    point.y >= arrowIconBounds.y &&
    point.y <= arrowIconBounds.y + arrowIconBounds.height
  ) {
    return {
      isInSelectionTool: true,
      toolingMode: "EDGE_ARROW" as const,
    };
  }

  // In the selection tool but not in any specific section
  return { isInSelectionTool: true, toolingMode: undefined };
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
  allEdges,
  activeEdges,
}: {
  context: CanvasRenderingContext2D;
  camera: Camera;
  canvasState: CanvasState;
  allLayers: Layer[];
  activeLayers: string[];
  allEdges: Edge[];
  activeEdges: string[];
  theme: string | undefined;
}): void => {
  if (canvasState.mode === CanvasMode.EdgeDrawing || canvasState.mode === CanvasMode.Translating) return;

  // Create an array of all selected layers to calculate the bounding box
  let selectedLayers: Layer[] = allLayers.filter((l) => activeLayers.includes(l.id));
  // Create an array of all selected edges to calculate the bounding box
  let selectedEdges: Edge[] = allEdges.filter((e) => activeEdges.includes(e.id));

  if (selectedLayers.length === 0 && selectedEdges.length === 0) return;

  // Get the bounding box of selected layers
  let box;

  if (selectedLayers.length > 0) {
    box = calculateLayerBoundingBox(selectedLayers);
  }

  if (selectedEdges.length > 0) {
    box = calculateEdgeBoundingBox(selectedEdges);
  }

  if (!box) return;

  // Get the toolbar bounds
  const bounds = calculateSelectionToolBounds({ allLayers, activeLayers, allEdges, activeEdges, camera });
  const borderStyleBounds = calculateBorderStyleBounds({ allLayers, activeLayers, camera });

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

  const SECTION_COUNT = selectedLayers ? 3 : selectedEdges ? 10 : 0;

  const firstDividerX = bounds.x + bounds.width / SECTION_COUNT;
  const secondDividerX = bounds.x + (bounds.width / SECTION_COUNT) * 2;

  // If layers are selected, draw the layer icons
  if (selectedLayers.length > 0) {
    // Draw Text button (first section)
    drawTextIcon(context, bounds.x + bounds.width / 6, bounds.y + bounds.height / 2, theme, camera, canvasState);

    // Draw the color button (middle section)
    drawColorButton(
      context,
      firstDividerX + bounds.width / 6,
      bounds.y + bounds.height / 2,
      colorToCss(selectedLayers.length === 1 ? selectedLayers[0].fill : { r: 72, g: 105, b: 253 }),
      camera,
      canvasState,
    );

    // Draw menu button (last section)
    drawMenuIcon(context, secondDividerX + bounds.width / 6, bounds.y + bounds.height / 2, camera, canvasState);
    // Draw color palette if in LAYER_COLOR mode
    if ("toolingModeState" in canvasState && canvasState.toolingModeState === "LAYER_COLOR") {
      drawColorPalette(context, { allLayers, activeLayers, camera, theme });
    }

    // Draw border style if in LAYER_BORDER mode
    if ("toolingModeState" in canvasState && canvasState.toolingModeState === "LAYER_BORDER" && borderStyleBounds) {
      drawBorderStyle(context, { allLayers, activeLayers, camera, theme });
      drawBorderIcon({
        context,
        x: borderStyleBounds.x + borderStyleBounds.width / 6,
        y: borderStyleBounds.y + borderStyleBounds.height / 2,
        camera,
        lineSize: 2,
        active:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.toolingMode === "LAYER_BORDER" &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.toolingModeBorderWidth === 2 &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          !canvasState.toolingModeBorderType,
      });
      drawBorderIcon({
        context,
        x: firstDividerX + borderStyleBounds.width / 6,
        y: borderStyleBounds.y + borderStyleBounds.height / 2,
        camera,
        lineSize: 4,
        active:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.toolingMode === "LAYER_BORDER" &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.toolingModeBorderWidth === 4 &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          !canvasState.toolingModeBorderType,
      });
      drawBorderIcon({
        context,
        x: secondDividerX + borderStyleBounds.width / 6,
        y: borderStyleBounds.y + borderStyleBounds.height / 2,
        camera,
        lineSize: 2,
        dashed: true,
        active:
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.toolingMode === "LAYER_BORDER" &&
          // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
          canvasState.toolingModeBorderType === "DASHED",
      });
    }
  }

  // If edge is selected, draw the edge icons
  if (selectedEdges.length > 0) {
    // Draw Text button (first section)
    drawTextIcon(context, bounds.x + bounds.width / 10, bounds.y + bounds.height / 2, theme, camera, canvasState);

    // Draw the color button (second section)
    drawColorButton(
      context,
      bounds.x + bounds.width / 3.4,
      bounds.y + bounds.height / 2,
      colorToCss(selectedLayers.length === 1 ? selectedLayers[0].fill : { r: 72, g: 105, b: 253 }),
      camera,
      canvasState,
    );

    // Draw menu button (middle section)
    drawMenuIcon(context, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, camera, canvasState);

    // Draw spline (third section)
    drawSplineIcon(
      context,
      bounds.x + bounds.width / 1.4,
      bounds.y + bounds.height / 2,
      camera,
      canvasState,
      selectedEdges,
    );

    // Draw arrow (last section)
    drawArrowIcon(
      context, 
      bounds.x + bounds.width / 1.1, 
      bounds.y + bounds.height / 2, 
      camera,
      // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
      (canvasState.toolingMode === "EDGE_ARROW" && canvasState.isInSelectionTool === true) ||
        // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
        canvasState.toolingModeState === "EDGE_ARROW",
      selectedEdges
    );
  }

  context.restore();
};

/**
 * Draws the color palette when in LAYER_COLOR mode
 */
const drawColorPalette = (
  context: CanvasRenderingContext2D,
  {
    allLayers,
    activeLayers,
    camera,
    theme,
  }: {
    allLayers: Layer[];
    activeLayers: string[];
    camera: Camera;
    theme: string | undefined;
  },
) => {
  const paletteBounds = calculateColorPaletteBounds({ allLayers, activeLayers, camera });

  if (!paletteBounds) return;

  // Draw the palette background
  context.fillStyle = theme === "dark" ? "#222" : "#333";
  context.beginPath();
  roundRect(context, paletteBounds.x, paletteBounds.y, paletteBounds.width, paletteBounds.height, paletteBounds.radius);
  context.fill();

  // Add shadow effect
  context.shadowColor = "rgba(0, 0, 0, 0.3)";
  context.shadowBlur = 8;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;

  // Draw color circles
  const colorCircles = calculateColorCirclesBounds({ allLayers, activeLayers, camera });

  if (!colorCircles) return;

  colorCircles.forEach((circle) => {
    // Draw color circle
    context.fillStyle = circle.color;
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.fill();

    // Draw a white border around the circle
    context.strokeStyle = "#5D5D5DFF";
    context.lineWidth = Math.max(1, 1 / camera.scale);
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.stroke();
  });
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
 * Draws the text icon in the selection toolbar
 */
const drawTextIcon = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  theme: string | undefined,
  camera: Camera,
  canvasState: CanvasState,
) => {
  // Draw the active background
  drawActiveBg(
    context,
    x,
    y,
    camera,
    // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
    (canvasState.toolingMode === "LAYER_SHAPE" && canvasState.isInSelectionTool === true) ||
      // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
      canvasState.toolingModeState === "LAYER_SHAPE",
  );

  const scale = Math.max(1, 1 / camera.scale);
  const size = 24 * scale * 0.7; // Scale the icon slightly to fit better

  // Calculate offset to center the icon correctly
  const offsetX = x - size / 2;
  const offsetY = y - size / 2;

  // Set stroke style
  context.strokeStyle = theme === "dark" ? "#fff" : "#fff";
  context.lineWidth = Math.max(2, 2 / camera.scale);
  context.lineCap = "round";
  context.lineJoin = "round";

  // Draw SVG paths
  // 1. Draw polyline: <polyline points="4 7 4 4 20 4 20 7"/>
  context.beginPath();
  context.moveTo(offsetX + (4 / 24) * size, offsetY + (7 / 24) * size);
  context.lineTo(offsetX + (4 / 24) * size, offsetY + (4 / 24) * size);
  context.lineTo(offsetX + (20 / 24) * size, offsetY + (4 / 24) * size);
  context.lineTo(offsetX + (20 / 24) * size, offsetY + (7 / 24) * size);
  context.stroke();

  // 2. Draw line: <line x1="9" x2="15" y1="20" y2="20"/>
  context.beginPath();
  context.moveTo(offsetX + (9 / 24) * size, offsetY + (20 / 24) * size);
  context.lineTo(offsetX + (15 / 24) * size, offsetY + (20 / 24) * size);
  context.stroke();

  // 3. Draw line: <line x1="12" x2="12" y1="4" y2="20"/>
  context.beginPath();
  context.moveTo(offsetX + (12 / 24) * size, offsetY + (4 / 24) * size);
  context.lineTo(offsetX + (12 / 24) * size, offsetY + (20 / 24) * size);
  context.stroke();
};

/**
 * Draws the color button in the selection toolbar
 */
const drawColorButton = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  camera: Camera,
  canvasState: CanvasState,
) => {
  // Draw the active background
  drawActiveBg(
    context,
    x,
    y,
    camera,
    // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
    (canvasState.toolingMode === "LAYER_COLOR" && canvasState.isInSelectionTool === true) ||
      // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
      canvasState.toolingModeState === "LAYER_COLOR",
  );

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
  camera: Camera,
  canvasState: CanvasState,
) => {
  // Draw the active background
  drawActiveBg(
    context,
    x,
    y,
    camera,
    // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
    (canvasState.toolingMode === "LAYER_BORDER" && canvasState.isInSelectionTool === true) ||
      // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
      canvasState.toolingModeState === "LAYER_BORDER",
  );

  const width = Math.max(16, 16 / camera.scale);
  let lineGap = Math.max(5, 5 / camera.scale);

  context.strokeStyle = "#fff";
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
  context.closePath();
};

/**
 * Draws the border style when in LAYER_BORDER mode
 */

const drawBorderStyle = (
  context: CanvasRenderingContext2D,
  {
    allLayers,
    activeLayers,
    camera,
    theme,
  }: {
    allLayers: Layer[];
    activeLayers: string[];
    camera: Camera;
    theme: string | undefined;
  },
) => {
  const borderStyleBounds = calculateBorderStyleBounds({ allLayers, activeLayers, camera });

  if (!borderStyleBounds) return;

  // Draw the palette background
  context.save();
  context.beginPath();
  context.fillStyle = theme === "dark" ? "#222" : "#333";
  context.beginPath();
  roundRect(
    context,
    borderStyleBounds.x,
    borderStyleBounds.y,
    borderStyleBounds.width,
    borderStyleBounds.height,
    borderStyleBounds.radius,
  );
  context.fill();

  // Add shadow effect
  context.shadowColor = "rgba(0, 0, 0, 0.3)";
  context.shadowBlur = 8;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.closePath();

  // Restore context state
  context.restore();
};

/**
 * Draws the menu icon (hamburger menu) in the selection toolbar
 */
const drawBorderIcon = ({
  context,
  x,
  y,
  camera,
  lineSize,
  active,
  dashed,
}: {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  camera: Camera;
  lineSize: number;
  active: boolean;
  dashed?: boolean;
}) => {
  // Draw the active background
  drawActiveBg(context, x, y, camera, active);

  const width = Math.max(12, 12 / camera.scale);

  // Set stroke style first
  context.strokeStyle = "#fff";
  context.lineWidth = Math.max(lineSize, lineSize / camera.scale);

  // Set dash pattern if needed
  if (dashed) {
    context.setLineDash([1, Math.max(4, 4 / camera.scale)]); // Dashed line
  } else {
    context.setLineDash([]); // Solid line (reset any previous dash pattern)
  }

  // Draw the diagonal line
  context.beginPath();
  context.moveTo(x - width / 2, y - width / 2);
  context.lineTo(x + width / 2, y + width / 2);
  context.stroke();
  context.closePath();
};

/**
 * Draws the spline icon in the selection toolbar
 */
const drawSplineIcon = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  camera: Camera,
  canvasState: CanvasState,
  selectedEdges: Edge[],
) => {
  // @ts-ignore - handleInfo property exists on Edge mode but TypeScript doesn't know
  // const activeEdge = selectedEdges.find((edge) => edge.id === canvasState.handleInfo?.edgeId);
  const activeEdge = selectedEdges[0];

  if (!activeEdge) return;

  // Draw the active background

  drawActiveBg(context, x, y, camera, true);

  const scale = Math.max(1, 1 / camera.scale);
  const size = 24 * scale * 0.7; // Scale the icon slightly to fit better

  // Calculate offset to center the icon correctly
  const offsetX = x - size / 2;
  const offsetY = y - size / 2;

  // Set stroke style
  context.strokeStyle = "#fff";
  context.lineWidth = Math.max(1, 1 / camera.scale);
  context.lineCap = "round";
  context.lineJoin = "round";

  // Draw the first circle at (19, 5)
  const circle1X = offsetX + (19 / 24) * size;
  const circle1Y = offsetY + (5 / 24) * size;
  const circle1Radius = (2 / 24) * size;

  context.beginPath();
  context.arc(circle1X, circle1Y, circle1Radius, 0, Math.PI * 2);
  context.stroke();

  // Draw the second circle at (5, 19)
  const circle2X = offsetX + (5 / 24) * size;
  const circle2Y = offsetY + (19 / 24) * size;
  const circle2Radius = (2 / 24) * size;

  context.beginPath();
  context.arc(circle2X, circle2Y, circle2Radius, 0, Math.PI * 2);
  context.stroke();

  // Draw the curved path from (5, 17) to (17, 5)
  const startX = offsetX + (5 / 24) * size;
  const startY = offsetY + (17 / 24) * size;
  const endX = offsetX + (17 / 24) * size;
  const endY = offsetY + (5 / 24) * size;

  context.beginPath();

  switch (activeEdge.shape) {
    case EdgeShape.Curved:
      context.moveTo(startX, startY);
      // Approximate the "A12 12 0 0 1" arc with a quadratic curve
      // For a better approximation, we could use a bezier curve with control points
      // eslint-disable-next-line no-case-declarations
      const controlX = offsetX + (11 / 64) * size;
      // eslint-disable-next-line no-case-declarations
      const controlY = offsetY + (11 / 64) * size;

      context.quadraticCurveTo(controlX, controlY, endX, endY);
      break;
    case EdgeShape.SmoothStep:
      context.moveTo(startX, startY);
      context.lineTo(startX, endY + 5);
      context.lineTo(endX + 1.5, endY + 5);
      context.lineTo(endX + 1.5, endY + 2);

      context.moveTo(startX + 1, startY);
      context.lineTo(endX, endY + 1);
      break;
    case EdgeShape.Line:
      context.moveTo(startX + 1, startY);
      context.lineTo(endX, endY + 1);
      break;
  }

  context.stroke();
};

/**
 * Draws the arrow icon in the selection toolbar
 */
const drawArrowIcon = (
  context: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  camera: Camera, 
  active: boolean,
  selectedEdges: Edge[]
) => {
  // Draw the active background
  drawActiveBg(context, x, y, camera, active);
  
  const scale = Math.max(1, 1 / camera.scale);
  const size = 24 * scale * 0.7; // Scale the icon slightly to fit better

  // Calculate offset to center the icon correctly
  const offsetX = x - size / 2;
  const offsetY = y - size / 2;

  // Set stroke style
  // context.strokeStyle = "#4869fd";
  context.strokeStyle = "#4869fd";
  context.lineWidth = Math.max(1.5, 1.5 / camera.scale);
  context.lineCap = "round";
  context.lineJoin = "round";
  
  // Draw the arrow path from the SVG
  context.beginPath();
  
  // Start point at (6, 9)
  context.moveTo(offsetX + (6 / 24) * size, offsetY + (9 / 24) * size);
  
  // Line to (12, 9)
  context.lineTo(offsetX + (12 / 24) * size, offsetY + (9 / 24) * size);
  
  // Line to (12, 5)
  context.lineTo(offsetX + (12 / 24) * size, offsetY + (5 / 24) * size);
  
  // Line to (19, 12) - the arrow tip
  context.lineTo(offsetX + (19 / 24) * size, offsetY + (12 / 24) * size);
  
  // Line to (12, 19)
  context.lineTo(offsetX + (12 / 24) * size, offsetY + (19 / 24) * size);
  
  // Line to (12, 15)
  context.lineTo(offsetX + (12 / 24) * size, offsetY + (15 / 24) * size);
  
  // Line back to (6, 15)
  context.lineTo(offsetX + (6 / 24) * size, offsetY + (15 / 24) * size);
  
  // Close the path to get back to (6, 9)
  context.lineTo(offsetX + (6 / 24) * size, offsetY + (9 / 24) * size);
  
  // We can either stroke the outline or fill the arrow
  context.stroke(); // For outline
};

// Draw the active background
const drawActiveBg = (context: CanvasRenderingContext2D, x: number, y: number, camera: Camera, active: boolean) => {
  if (!active) return;

  const activeBgRadius = Math.max(5, 5 / camera.scale);
  const activeBgSize = Math.max(30, 30 / camera.scale);

  context.fillStyle = "#444";
  roundRect(context, x - activeBgSize / 2, y - activeBgSize / 2, activeBgSize, activeBgSize, activeBgRadius);
  context.fill();
};
