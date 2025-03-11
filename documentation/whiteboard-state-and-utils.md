# Whiteboard State Management and Utilities

## Recoil State Management

The whiteboard component utilizes Recoil for state management, allowing for efficient and scalable state handling across the application. Key Recoil atoms and selectors include:

- **cameraStateAtom**: Manages the camera's position and zoom level on the canvas.
- **canvasStateAtom**: Tracks the current mode of the canvas, such as translating, resizing, or drawing.
- **layerAtomState**: Holds the state of all layers on the whiteboard, including their positions and properties.
- **edgesAtomState**: Manages the state of all edges connecting layers.
- **activeLayersAtom**: Keeps track of currently selected layers.
- **activeEdgeIdAtom**: Stores the ID of the currently active edge.
- **hoveredEdgeIdAtom**: Holds the ID of the edge currently being hovered over.
- **isEdgeNearLayerAtom**: Boolean state indicating if an edge is near a layer.
- **nearestLayerAtom**: Stores the nearest layer to a given point.

These atoms and selectors enable the whiteboard to efficiently manage complex interactions and state changes, providing a responsive user experience.

## Types in `canvas.ts`

The `canvas.ts` file defines several types and enums crucial for the whiteboard's functionality:

- **Camera**: Represents the camera's position and zoom level.
- **Color**: Defines a color using RGB values.
- **HandlePosition**: Enum for possible handle positions on a layer (Top, Left, Right, Bottom).
- **EdgeOrientation**: Specifies the orientation of an edge.
- **EdgeType**: Enum for edge styles (Solid, Dashed).
- **EdgeShape**: Enum for edge shapes (SmoothStep, Curved, Line).
- **Edge**: Represents an edge connecting two layers, including properties like start and end points, color, and thickness.
- **LayerType**: Enum for different layer types (Diamond, Rectangle, Ellipse, Path).
- **Layer**: Union type for different layer shapes, each with specific properties.
- **Point**: Represents a point in 2D space.
- **XYWH**: Represents a rectangle's position and dimensions.
- **CanvasState**: Union type for different canvas modes, such as translating, resizing, or drawing.
- **CanvasMode**: Enum for various canvas modes.

These types ensure type safety and clarity in the whiteboard's implementation.

## Utility Functions in `canvasUtils.ts`

The `canvasUtils.ts` file contains utility functions that assist in various operations on the whiteboard:

- **isValidLayer**: Validates if an object is a valid layer.
- **isValidEdge**: Validates if an object is a valid edge.
- **getLayerById**: Retrieves a layer by its ID.
- **connectionIdToColor**: Maps a connection ID to a color.
- **randomUserColor**: Generates a random color for a user.
- **pointerEventToCanvasPoint**: Converts a pointer event to a canvas point.
- **colorToCss**: Converts a color object to a CSS color string.
- **fillRGBA**: Converts a color to an RGBA string based on the theme.
- **findNonOverlappingPosition**: Finds a non-overlapping position for a new layer.
- **resizeBounds**: Resizes a rectangle based on a corner and a point.
- **findNearestLayerHandle**: Finds the nearest handle on a layer to a given point.
- **getContrastingTextColor**: Determines a contrasting text color for a given color.
- **getOrientationFromPosition**: Determines the orientation of an edge based on handle position.
- **calculateControlPoints**: Calculates control points for a curved edge.
- **isEdgeCloseToLayer**: Checks if an edge is close to a layer.
- **calculateNewLayerPositions**: Calculates new positions for a layer and edge based on a handle position.
- **calculateNonOverlappingLayerPosition**: Calculates a non-overlapping position for a new layer.
- **getHandlePosition**: Gets the position of a handle on a layer.
- **getOppositeHandlePosition**: Gets the opposite handle position.
- **penPointsToPathLayer**: Converts pen points to a path layer.
- **getSvgPathFromStroke**: Generates an SVG path from a stroke.
- **generateMermaidFlowchart**: Generates a Mermaid flowchart from edges and layers.

## Utility Functions in `edgeUtils.ts`

The `edgeUtils.ts` file provides functions specifically for edge manipulation:

- **getControlWithCurvature**: Calculates control points for a Bezier curve with curvature.
- **getEdgeCenter**: Calculates the center of an edge.
- **edgeSmoothStepPathString**: Generates a path string for a smooth step edge.
- **edgeBezierPathString**: Generates a Bezier path string for an edge.

These utilities are essential for handling complex interactions and rendering on the whiteboard. 