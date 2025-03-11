# Whiteboard Component Details

## Sub-Components

### 1. Toolbar Component
The Toolbar component provides users with tools to interact with the whiteboard:

```typescript
// Key imports
import { Circle, Diamond, Hand, MousePointer2, MoveRight, Redo2, Square, Type, Undo2 } from "lucide-react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { CanvasMode, LayerType } from "@/_types";
```

#### Features:
- **Undo/Redo**: Allows reversing or redoing actions
- **Selection Mode**: For selecting and manipulating existing elements
- **Hand Tool**: For panning around the canvas
- **Shape Tools**: Rectangle, Ellipse, and Diamond shape creation
- **Edge Tool**: Connection creation between shapes

#### Implementation Details:
- Utilizes Recoil for state management
- Changes the `canvasStateAtom` to reflect the current tool
- Provides visual feedback for the active tool
- Resets selection state when changing tools

### 2. Layer Components
The whiteboard uses several components for handling different aspects of layers (shapes):

#### LayerPreview
Renders the actual shape on the canvas based on its type and properties.

#### LayerHandles
Displays handles around selected layers for resizing and connection points.

#### SelectionBox
Shows a bounding box around selected layers with resize handles.

#### SelectionTools
Provides a floating toolbar near selected layers with specific actions:
- Color changing
- Deletion
- Text editing
- Layer ordering (bring to front, send to back)

#### ShadowLayer
Displays a temporary visual representation when moving or creating layers.

### 3. Edge Components
Edge components handle the connections between layers:

#### EdgePreview
Renders the actual connections with different styles (line, curved, or step).

#### EdgeSelectionBox
Shows a bounding area around selected edges.

#### EdgeSelectionTools
Provides a floating toolbar near selected edges with specific actions:
- Style changing (solid/dashed)
- Color changing
- Arrow customization
- Deletion

#### ShadowEdge
Displays a temporary visual when creating or modifying an edge.

### 4. Collaborative Components
Real-time collaboration features:

#### CursorPresence
Displays other users' cursors in real-time using Ably Spaces.

```typescript
// Cursor presence implementation
const { space } = useSpace();
```

## Event Flow and State Management

### Layer Creation Flow
1. User selects a shape tool from the Toolbar
2. `canvasStateAtom` is updated to `CanvasMode.Inserting` with the selected shape type
3. User clicks on the canvas, triggering `handlePointerDown`
4. A new layer is created with default properties and positioned at the click point
5. The layer is added to the `layerAtomState`
6. The layer is synchronized with other users via Ably

### Layer Selection and Manipulation
1. User clicks on a layer, triggering `handleLayerPointerDown`
2. The layer ID is added to the `activeLayersAtom` state
3. `canvasStateAtom` is updated to `CanvasMode.LayerSelected`
4. Selection box and tools appear around the layer
5. User can:
   - Move the layer by dragging
   - Resize by dragging handles
   - Edit properties via the selection tools
   - Connect to other layers via handles

### Edge Creation Flow
1. User hovers over a layer handle, highlighting it
2. User drags from the handle, starting the edge creation process
3. `canvasStateAtom` is updated to `CanvasMode.Edge`
4. A shadow edge appears, following the mouse position
5. When hovering over a valid target handle, it highlights
6. Releasing the mouse completes the edge creation
7. The new edge is added to `edgesAtomState`
8. The edge is synchronized with other users via Ably

## Technical Implementation

### Zoom and Pan Implementation
The whiteboard uses D3's zoom behavior for smooth zooming and panning:

```typescript
// Zoom behavior setup
const zoomBehavior = zoom<SVGSVGElement, unknown>()
  .scaleExtent([zoomFactor.min, zoomFactor.max])
  .filter((event: any) => {
    // Logic to handle different input types (mouse, trackpad)
  })
  .on("zoom", (event) => {
    // Update transform
    const { x, y, k } = event.transform;
    g.attr("transform", event.transform);
    setCamera({ x, y, scale: k });
  });
```

### Selection Net Implementation
For selecting multiple layers by dragging:

1. User starts dragging in empty space
2. `canvasStateAtom` is updated to `CanvasMode.SelectionNet`
3. A selection rectangle is displayed
4. On mouse release, all layers intersecting with the rectangle are selected
5. `activeLayersAtom` is updated with all selected layer IDs

### Save and Load Functionality
The whiteboard automatically saves content:
- On tab/window close
- On visibility change (switching tabs)
- Before navigation
- Periodically during editing

```typescript
const handleVisibilityChange = async () => {
  if (document.visibilityState === "hidden" && !isCapturing) {
    isCapturing = true;
    await saveMindmap();
    isCapturing = false;
  }
};
```

## Key Utility Functions

### Layout and Positioning
- `calculateNewLayerPositions`: Determines optimal positions for new layers
- `calculateNonOverlappingLayerPosition`: Prevents layers from overlapping
- `findIntersectingLayersWithRectangle`: Used for selection net functionality
- `findNearestLayerHandle`: Finds the closest handle during edge creation

### Geometry Calculations
- `getHandlePosition`: Calculates exact handle positions for layers
- `getOppositeHandlePosition`: Finds opposite handles for straight edges
- `resizeBounds`: Handles the math for resizing operations
- `pointerEventToCanvasPoint`: Converts screen coordinates to canvas coordinates

### Permission Handling
- `checkPermission`: Verifies user permissions for specific operations
- Integrates with the `userMindmapDetails.connectedMemberPermissions` system 