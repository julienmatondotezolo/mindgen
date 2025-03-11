# Whiteboard Technical Implementation

## Core Technologies

The whiteboard component leverages several key technologies:

- **React**: For component-based UI architecture
- **TypeScript**: For type safety and improved developer experience
- **Recoil**: For state management
- **D3.js**: For zoom and pan functionality
- **Ably Spaces**: For real-time collaboration features
- **SVG**: For rendering all shapes and connections

## State Management Architecture

### Recoil Atoms and Hooks

The whiteboard uses Recoil atoms to manage various aspects of its state:

```typescript
// Camera state controls the viewport position and zoom level
const [camera, setCamera] = useRecoilState(cameraStateAtom);

// Canvas state determines the current interaction mode
const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

// Layers state stores all shapes on the whiteboard
const [layers, setLayers] = useRecoilState(layerAtomState);

// Edges state stores all connections between shapes
const [edges, setEdges] = useRecoilState(edgesAtomState);

// Active layers tracks currently selected layers
const setActiveLayerIDs = useSetRecoilState(activeLayersAtom);
```

### Custom Hooks

The component defines several custom hooks for common operations:

```typescript
// Hooks for managing layers
const addLayer = useAddElement();
const removeLayer = useRemoveElement();
const updateLayer = useUpdateElement();
const selectLayer = useSelectElement();
const unSelectLayer = useUnSelectElement();

// Hooks for managing edges
const addEdge = useAddEdgeElement();
const removeEdge = useRemoveEdge();
const updateEdge = useUpdateEdge();
const selectEdge = useSelectEdgeElement();
const unSelectEdge = useUnSelectEdgeElement();
```

## SVG Structure and Rendering

The main rendering structure is built with SVG elements:

```typescript
<svg
  ref={svgRef}
  className="h-full w-full absolute inset-0"
  style={{
    backgroundPosition: `${camera.x}px ${camera.y}px`,
    backgroundImage: `radial-gradient(${theme === "dark" ? "#111212" : "#e5e7eb"} ${
      1 * camera.scale
    }px, transparent 1px)`,
    backgroundSize: `${16 * camera.scale}px ${16 * camera.scale}px`,
  }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
>
  <g ref={gRef}>
    {/* Edges are rendered first (underneath layers) */}
    {edges.map((edge, index) => (
      <EdgePreview
        key={index}
        edge={edge}
        onEdgePointerDown={(e, edgeId) => handleEdgeClick(e, edgeId)}
        ARROW_SIZE={ARROW_SIZE}
      />
    ))}
    
    {/* Layers (shapes) are rendered on top of edges */}
    {sortLayersBySelection(layers).map((layer, index) => (
      <LayerPreview
        key={index}
        layer={layer}
        onLayerPointerDown={(e, layerId, origin) => handleLayerPointerDown(e, layerId, origin!)}
      />
    ))}
    
    {/* UI elements for interaction */}
    <LayerHandles />
    <SelectionBox />
    <SelectionTools />
    <EdgeSelectionBox />
    <EdgeSelectionTools />
    <CursorPresence />
  </g>
</svg>
```

## Event Handling System

### Pointer Events

The component uses pointer events for cross-device compatibility:

```typescript
const handlePointerDown = (e: React.PointerEvent) => {
  // Prevent default browser behaviors
  e.preventDefault();
  
  // Convert screen coordinates to canvas coordinates
  const point = pointerEventToCanvasPoint(e, camera);
  
  // Handle different canvas modes
  switch (canvasState.mode) {
    case CanvasMode.None:
      // Start selection net
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin: point,
        current: point,
      });
      break;
      
    case CanvasMode.Inserting:
      // Create a new layer
      const id = nanoid();
      const defaultWidth = 200;
      const defaultHeight = 100;
      
      // Create new layer based on the selected type
      addLayer({
        id,
        type: canvasState.layerType,
        x: point.x - defaultWidth / 2,
        y: point.y - defaultHeight / 2,
        width: defaultWidth,
        height: defaultHeight,
        fill: { r: 255, g: 255, b: 255 },
      });
      
      // Select the new layer
      selectLayer(id);
      break;
    
    // ... other modes handling
  }
};
```

### Keyboard Events

Keyboard event handlers provide shortcuts for common operations:

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  // Space toggles grab mode for panning
  if (event.code === "Space") {
    if (canvasState.mode === CanvasMode.Typing || !checkPermission(PERMISSIONS, "UPDATE")) return;
    event.preventDefault();
    setCanvasState({
      mode: CanvasMode.Grab,
    });
  }
  
  // Backspace deletes selected layers
  if (event.code === "Backspace" && allActiveLayers?.length > 0 && canvasState.mode !== CanvasMode.Typing) {
    if (!checkPermission(PERMISSIONS, "DELETE")) {
      alert("You don't have the rights to delete");
      return;
    }
    
    const selectedLayers = layers.filter((layer) => allActiveLayers?.includes(layer.id));
    const layerIdsToDelete = selectedLayers.map((layer) => layer.id);
    
    removeLayer({ layerIdsToDelete });
    handleUnSelectLayer();
    
    for (const layer of selectedLayers) {
      removeEdgesConnectedToLayer(layer.id);
    }
  }
  
  // ... other key handlers
};
```

## Real-time Collaboration

### Ably Spaces Integration

The whiteboard integrates with Ably Spaces for real-time collaboration:

```typescript
// Set up the space connection
const { space } = useSpace();

// Using live value hooks for synchronization
useLiveValue({ boardId });

// Cursor presence component for showing other users
<CursorPresence />
```

### Synchronization Strategy

Changes to the whiteboard are synchronized through two mechanisms:

1. **Live Values**: For real-time updates during editing
2. **Server Persistence**: For durable storage between sessions

```typescript
// Save mindmap to server
const saveMindmap = useCallback(async () => {
  if (!checkPermission(PERMISSIONS, "UPDATE")) return;
  
  try {
    await updateBoardLayersById.mutateAsync({
      id: boardId,
      layers: layers,
      edges: edges,
    });
  } catch (error) {
    console.error("Error saving mindmap:", error);
  }
}, [boardId, checkPermission, edges, layers, PERMISSIONS]);
```

## Zoom and Pan Implementation

The zoom and pan functionality is implemented using D3.js:

```typescript
// Create the zoom behavior
const zoomBehavior = zoom<SVGSVGElement, unknown>()
  .scaleExtent([zoomFactor.min, zoomFactor.max])
  .filter((event: any) => {
    // Special handling for trackpad vs. mouse wheel
    const isTrackpad = event.wheelDeltaY
      ? Math.abs(event.wheelDeltaY) === Math.abs(event.deltaY * 3)
      : Math.abs(event.deltaY) < 50;
      
    if (event.type === "wheel") {
      if (event.ctrlKey) {
        event.preventDefault(); // Prevent browser zoom
        return true; // Allow our zoom
      }
      if (isTrackpad) {
        // Handle trackpad differently
        event.preventDefault();
        const currentTransform = zoomTransform(svg.node()!);
        const transform = zoomIdentity
          .translate(currentTransform.x - event.deltaX, currentTransform.y - event.deltaY)
          .scale(currentTransform.k);
        svg.call(zoomBehavior.transform, transform);
        return false;
      }
    }
    
    return canvasState.mode === CanvasMode.Grab;
  })
  .on("zoom", (event) => {
    // Update the transform
    const { x, y, k } = event.transform;
    g.attr("transform", event.transform);
    setCamera({ x, y, scale: k });
  });

// Apply the zoom behavior
svg.call(zoomBehavior);
```

## Export Functionality

The whiteboard supports exporting to image using html2canvas:

```typescript
const captureCanvas = async () => {
  setCanvasState({ mode: CanvasMode.Exporting });
  
  try {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    
    // Use html2canvas to create an image
    const capturedCanvas = await html2canvas(canvas, {
      backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
      // Additional options for better quality
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    
    // Convert to image and download
    capturedCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `mindmap-${boardId}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error("Error exporting canvas:", error);
  } finally {
    setCanvasState({ mode: CanvasMode.None });
  }
};
```

## Performance Optimizations

### Rendering Optimizations

Several optimizations are implemented to maintain good performance:

1. **Layer Sorting**:
```typescript
const sortLayersBySelection = (layers: Layer[]) => {
  // Selected layers should be rendered on top
  return [...layers].sort((a, b) => {
    const aIsSelected = allActiveLayers?.includes(a.id);
    const bIsSelected = allActiveLayers?.includes(b.id);
    if (aIsSelected && !bIsSelected) return 1;
    if (!aIsSelected && bIsSelected) return -1;
    return 0;
  });
};
```

2. **Selection Optimization**:
```typescript
// Using efficient rectangle intersection for selection
const findIntersectingLayersWithRectangle = (layers: Layer[], selectionRect: XYWH) => {
  return layers.filter((layer) => {
    // Check if layer intersects with selection rectangle
    return (
      layer.x < selectionRect.x + selectionRect.width &&
      layer.x + layer.width > selectionRect.x &&
      layer.y < selectionRect.y + selectionRect.height &&
      layer.y + layer.height > selectionRect.y
    );
  });
};
```

3. **Layer Limits**:
```typescript
// Prevent performance issues with too many layers
const MAX_LAYERS = 100;

// Check before adding new layers
if (layers.length >= MAX_LAYERS) {
  alert(`Maximum limit of ${MAX_LAYERS} shapes reached`);
  return;
}
```

## Security Considerations

### Permission System

The whiteboard implements a permission system:

```typescript
// Check if user has required permission
const checkPermission = (permissions: any, action: "READ" | "UPDATE" | "DELETE") => {
  if (!permissions) return false;
  return permissions[action.toLowerCase()];
};

// Usage in component
if (!checkPermission(PERMISSIONS, "DELETE")) {
  alert("You don't have the rights to delete");
  return;
}
```

## Known Limitations and Edge Cases

1. **Large Canvas Performance**: Performance may degrade with extremely large numbers of elements.
2. **Text Editing**: Complex text formatting is not supported.
3. **Browser Compatibility**: Some advanced features may not work in older browsers.
4. **Mobile Experience**: While it supports touch events, the UI is optimized for desktop use.
5. **Export Quality**: Image export quality may vary based on canvas size and complexity. 