# Whiteboard Component Documentation

## Overview
The Whiteboard component is a complex, interactive SVG-based canvas that allows users to create and manipulate various shapes, connect them with edges, and collaborate in real-time. It functions as a mind-mapping or diagramming tool with multiple interactive features and modes.

## Core Features
- Real-time collaborative editing
- Various shape types (Rectangle, Ellipse, Diamond, Path)
- Edge connections between shapes
- Selection, resizing, and moving of elements
- Zoom and pan functionality
- Undo/redo operations
- Export/import capabilities

## Component Architecture

### State Management
The whiteboard uses Recoil for state management with multiple atom states:
- `cameraStateAtom`: Controls the viewport position and zoom level
- `canvasStateAtom`: Manages the current interaction mode
- `layerAtomState`: Stores all shapes (layers) on the whiteboard
- `edgesAtomState`: Stores all connections between shapes
- `activeLayersAtom`: Tracks currently selected layers
- `activeEdgeIdAtom`: Tracks currently selected edges

### Interaction Modes
The whiteboard has multiple interaction modes defined in the `CanvasMode` enum:
- `None`: Default mode, no special interaction
- `Grab`: Pan/move the canvas
- `Pressing`: User is pressing down (before a drag action)
- `SelectionNet`: Drawing a selection rectangle to select multiple elements
- `LayerSelected`: One or more layers are selected
- `EdgeSelected`: One or more edges are selected
- `Inserting`: Adding a new shape to the canvas
- `Translating`: Moving a layer
- `Resizing`: Resizing a layer
- `Pencil`: Drawing mode (for Path shapes)
- `Edge`, `EdgeActive`, `EdgeDrawing`, `EdgeEditing`: Various states for edge creation and modification
- `Typing`: Text editing mode
- `Tooling`: Tool selection mode
- `Exporting`, `Importing`: For saving or loading whiteboard content

## Data Structures

### Layer Types
The whiteboard supports multiple shape types:
- **Rectangle**: Basic rectangular shape
- **Ellipse**: Oval/circular shape
- **Diamond**: Diamond/rhombus shape
- **Path**: Freeform shape defined by points

All shapes inherit from `LayerWithGeometry` which includes:
- Position (`x`, `y`)
- Dimensions (`width`, `height`)
- Appearance (`fill`, `borderColor`, `borderWidth`, `borderType`)
- Text content (`value`, `valueStyle`)

### Edge Types
Connections between shapes are handled by `Edge` objects with these properties:
- Connection points (`start`, `end`)
- Connected layers (`fromLayerId`, `toLayerId`)
- Appearance (`color`, `hoverColor`, `thickness`)
- Style (`type`, `shape`, `orientation`)
- Decorations (`arrowStart`, `arrowEnd`, `label`)

## Key Functions and Event Handlers

### Initialization
- The component initializes with zoom behavior using d3-zoom
- Sets up event listeners for visibility changes and page navigation
- Configures Ably spaces for real-time collaboration

### Mouse Interaction
- `handlePointerDown`: Captures initial mouse/touch interaction
- `handlePointerMove`: Handles drag operations based on current mode
- `handlePointerUp`: Completes the current operation
- `handleMouseDown`/`handleMouseUp`: Basic mouse state tracking
- `handleLayerPointerDown`: Specific handler for clicking on shapes
- `handleEdgeClick`: Specific handler for clicking on connections

### Keyboard Shortcuts
- Space: Toggles grab mode for panning
- Backspace/Delete: Removes selected elements
- Enter: Completes current operations

### Viewport Controls
- `zoomIn`/`zoomOut`: Changes zoom level
- `fitView`: Adjusts viewport to show all content
- Various transform functions for handling the camera position

### Layer Operations
- `selectLayer`/`unSelectLayer`: Selection handling
- `addLayer`: Creates new shapes
- `updateLayer`: Modifies existing shapes
- `removeLayer`: Deletes shapes
- `handleLayerPointerDown`/`handleResizeHandlePointerDown`: For interaction with shapes

### Edge Operations
- `addEdge`: Creates new connections
- `updateEdge`: Modifies existing connections
- `removeEdge`: Deletes connections
- `handleEdgeHandlePointerDown`: For interaction with connections

### Collaborative Features
- Cursor presence tracking to show other users' cursors
- Real-time synchronization of all changes
- Permission-based access control

## Toolbar Integration
The Toolbar component provides UI buttons for:
- Undo/Redo operations
- Selection mode toggle
- Shape creation tools (Rectangle, Ellipse, Diamond)
- Edge creation mode
- View controls

## Rendering Structure
The main rendering structure is composed of:
- SVG element with background grid
- Group element containing all layers and edges
- Special UI elements for selection boxes, handles, tools, etc.
- Cursor presence indicators for real-time collaboration

## State Persistence
- Auto-save on tab/window close
- Navigation interceptors to save state before leaving
- Mutation handling for server synchronization

## Performance Considerations
- Limit of 100 maximum layers to prevent performance issues
- Optimized rendering for large canvases
- Efficient updates through careful state management

## Security and Permissions
- Permission-based access control for various operations
- User authentication integration
- Role-based feature availability

## Extensions and Integration
- Export to image functionality
- Integration with mind mapping data structures
- Next.js and TypeScript integration
- Dark/light theme support

## Event Flow Example
1. User clicks on Rectangle tool in toolbar
2. CanvasState changes to Inserting mode with Rectangle type
3. User clicks on canvas, triggering handlePointerDown
4. New Rectangle layer is created at click position
5. Layer is added to state and synchronized with other users
6. User can then select, move, resize or connect the new shape

This whiteboard provides a comprehensive set of features for creating and editing mind maps and diagrams with a focus on real-time collaboration and modern user experience. 