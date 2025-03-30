/**
 * Draw a cursor with username label
 */

import { CursorPosition } from "@ably/spaces";

import { uppercaseFirstLetter } from "@/utils";

export const drawCursor = ({
  context,
  username,
  userColor,
  position,
  cameraScale = 1,
}: {
  context: CanvasRenderingContext2D;
  username: string;
  userColor: string;
  position: CursorPosition;
  cameraScale?: number;
}): void => {
  if (!username) return;

  const { x, y } = position;

  // Save the current context state
  context.save();

  // Apply translation to cursor position
  context.translate(x, y);

  // Set cursor style
  context.fillStyle = userColor;
  context.strokeStyle = userColor;

  // Draw triangular pointer shape to match the image
  context.beginPath();
  // Scale the cursor size based on camera scale
  const cursorSize = 15 / cameraScale;

  // Draw the triangular cursor (simplified to match image)
  context.moveTo(0, 0);
  context.rotate((130 * Math.PI) / 180);
  context.lineTo(cursorSize * 0.5, cursorSize);
  context.lineTo(cursorSize, 0);
  context.closePath();
  context.fill();

  context.rotate((-130 * Math.PI) / 180);

  // Calculate label dimensions
  const fontSize = 12 / cameraScale; // Slightly larger font
  const paddingX = 8 / cameraScale;
  const paddingY = 6 / cameraScale;

  context.font = `bold ${fontSize}px sans-serif`; // Bold font to match image
  const textWidth = context.measureText(username).width;
  const labelWidth = textWidth + paddingX * 2;
  const labelHeight = fontSize + paddingY * 2;

  // Position label underneath the cursor with 5px offset
  const gapFromPointer = 16 / cameraScale;
  // Center the label horizontally relative to the cursor
  const labelX = cursorSize / 2 - labelWidth / 2 + gapFromPointer;
  // Position the label below the cursor with the specified gap
  const labelY = cursorSize;
  const borderRadius = 6 / cameraScale; // Larger border radius for more rounded corners

  // Add shadow effect
  context.shadowColor = "rgba(0, 0, 0, 0.3)";
  context.shadowBlur = 4 / cameraScale;
  context.shadowOffsetX = 1 / cameraScale;
  context.shadowOffsetY = 1 / cameraScale;

  // Draw label background
  context.fillStyle = userColor;
  context.beginPath();
  context.roundRect(labelX, labelY, labelWidth, labelHeight, borderRadius);
  context.fill();

  // Reset shadow for text
  context.shadowColor = "transparent";

  // Draw label text
  context.fillStyle = "white";
  context.textBaseline = "middle";
  context.fillText(uppercaseFirstLetter(username), labelX + labelWidth / 2, labelY + labelHeight / 2);

  // Restore the context state
  context.restore();
};
