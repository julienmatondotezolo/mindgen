/* eslint-disable no-unused-vars */
// src/components/Canvas.tsx
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  Edge,
  HandlePosition,
  LayerType,
  MindMapDetailsProps,
  Point,
  Side,
  User,
  XYWH,
} from "@/_types";
import { useSocket } from "@/hooks";
import {
  activeLayersAtom,
  canvasStateAtom,
  edgesAtomState,
  hoveredEdgeIdAtom,
  layerAtomState,
  useAddElement,
  useRemoveElement,
  useSelectElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";
import {
  calculateControlPoints,
  colorToCss,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  findNonOverlappingPosition,
  getOrientationFromPosition,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/utils";

import { Button } from "../ui";
import { CursorPresence } from "./collaborate";
import { LayerPreview } from "./LayerPreview";
import { LayerHandles, SelectionBox, SelectionTools } from "./layers";
import { Toolbar } from "./Toolbar";

const Whiteboard = ({
  userMindmapDetails,
  boardId,
}: {
  userMindmapDetails: MindMapDetailsProps | undefined;
  boardId: string;
}) => {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [showLayerAddButtons, setShowLayerAddButtons] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const [applyTransition, setApplyTransition] = useState(false);

  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 50,
    g: 20,
    b: 188,
  });

  const MAX_LAYERS = 100;

  const CANVAS_TRANSITION_TIME = 500;

  const ids: string[] = [];

  // ================  SOCKETS  ================== //

  const { socketEmit } = useSocket();
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  // ================  EDGES  ================== //

  const [edges, setEdges] = useRecoilState(edgesAtomState);
  const [hoveredEdgeId, setHoveredEdgeId] = useRecoilState(hoveredEdgeIdAtom);

  const [drawingEdge, setDrawingEdge] = useState<{ ongoing: boolean; lastEdgeId?: string; fromLayerId?: string }>({
    ongoing: false,
  });

  const ARROW_SIZE = 5;

  const removeEdgesConnectedToLayer = useCallback(
    (layerId: string) => {
      setEdges((prevEdges) => prevEdges.filter((edge) => edge.fromLayerId !== layerId && edge.toLayerId !== layerId));
    },
    [setEdges],
  );

  // ================  LAYERS  ================== //

  const layers = useRecoilValue(layerAtomState);

  const allActiveLayers = useRecoilValue(activeLayersAtom);
  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer) => userActiveLayer.userId === currentUserId)
    .map((item) => item.layerIds)[0];

  const allOtherUsersSelections = allActiveLayers.filter((item) => item.userId !== currentUserId);

  const layerIdsToColorSelection = useMemo(() => {
    if (allOtherUsersSelections[0]?.userId == undefined) return {};

    const layerIdsToColorSelection: Record<string, string> = {};

    for (const otherUsersSelections of allOtherUsersSelections) {
      let usersCount = 0;

      for (const layerId of otherUsersSelections?.layerIds) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(usersCount);
      }
      usersCount++;
    }

    return layerIdsToColorSelection;
  }, [allOtherUsersSelections]);

  const selectLayer = useSelectElement({ roomId: boardId });
  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const addLayer = useAddElement({ roomId: boardId });
  const updateLayer = useUpdateElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });

  const insertLayer = useCallback(
    (layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Note | LayerType.Path, position: Point) => {
      if (layers?.length >= MAX_LAYERS) {
        return;
      }

      const layerId = nanoid();

      const newLayer = {
        id: layerId.toString(),
        type: layerType,
        x: position.x,
        y: position.y,
        width: 200,
        height: 100,
        fill: { r: 255, g: 255, b: 255 },
      };

      addLayer(newLayer);

      selectLayer({ userId: currentUserId, layerIds: [newLayer.id] });
      setShowLayerAddButtons(true);

      setCanvasState({
        mode: CanvasMode.None,
      });
    },
    [addLayer, currentUserId, layers, selectLayer, setCanvasState],
  );

  const handleLayerPointerDown = useCallback(
    (e: React.PointerEvent, layerId: string, origin: Point) => {
      if (
        canvasState.mode === CanvasMode.Grab ||
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting ||
        canvasState.mode === CanvasMode.Typing
      ) {
        return;
      }

      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (e.shiftKey) {
        // If Shift is held, add the layerId to the activeLayerIds array without removing others

        ids.push(layerId);

        selectLayer({ userId: currentUserId, layerIds: ids });

        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin,
        });
      } else if (!activeLayerIDs?.includes(layerId)) {
        // setActiveLayerIDs([layerId]);
        selectLayer({ userId: currentUserId, layerIds: [layerId] });
      }

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [canvasState, camera, activeLayerIDs, setCanvasState, ids, selectLayer, currentUserId],
  );

  const onHandleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      setCanvasState({
        mode: CanvasMode.Edge,
      });
    },
    [setCanvasState],
  );

  const onHandleMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      setCanvasState({
        mode: CanvasMode.None,
      });
    },
    [setCanvasState],
  );

  const onHandleMouseDown = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        setEdges((prevEdges) =>
          prevEdges.map((edge) => (edge.id === drawingEdge.lastEdgeId ? { ...edge, fromLayerId: layerId } : edge)),
        );
        setDrawingEdge((prev) => ({ ...prev, fromLayerId: layerId }));
      }
    },
    [drawingEdge, setEdges],
  );

  const onHandleMouseUp = useCallback(
    (layerId: String, position: HandlePosition) => {
      const currentLayer = layers.find((layer) => layer.id === layerId);
      const LAYER_SPACING = 150; // Adjust this value to control the space between layers
      const HANDLE_DISTANCE = 20;

      if (!currentLayer) {
        console.error("Layer not found");
        return;
      }

      // Calculate the new position based on the clicked handle's position
      let newLayerPosition: Point;
      let newEdgePosition: Point;

      switch (position) {
        case HandlePosition.Left:
          newLayerPosition = { x: currentLayer.x - currentLayer.width - LAYER_SPACING, y: currentLayer.y };
          newEdgePosition = {
            x: currentLayer.x - currentLayer.width / 2 - HANDLE_DISTANCE,
            y: currentLayer.y + currentLayer.height / 2,
          };
          break;
        case HandlePosition.Top:
          newLayerPosition = { x: currentLayer.x, y: currentLayer.y - currentLayer.height - LAYER_SPACING };
          newEdgePosition = {
            x: currentLayer.x + currentLayer.width / 2,
            y: currentLayer.y - currentLayer.height - HANDLE_DISTANCE,
          };
          break;
        case HandlePosition.Right:
          newLayerPosition = { x: currentLayer.x + currentLayer.width + LAYER_SPACING, y: currentLayer.y };
          newEdgePosition = {
            x: currentLayer.x + currentLayer.width * 1.5 + HANDLE_DISTANCE,
            y: currentLayer.y + currentLayer.height / 2,
          };
          break;
        case HandlePosition.Bottom:
          newLayerPosition = { x: currentLayer.x, y: currentLayer.y + currentLayer.height + LAYER_SPACING };
          newEdgePosition = {
            x: currentLayer.x + currentLayer.width / 2,
            y: currentLayer.y + currentLayer.height * 2 + HANDLE_DISTANCE,
          };
          break;
        default:
          console.error("Invalid position");
          return;
      }

      // Find a non-overlapping position for the new layer
      const adjustedPosition = findNonOverlappingPosition({
        newPosition: newLayerPosition,
        layers,
        currentLayer,
        LAYER_SPACING,
      });

      const newLayerId = nanoid();

      const newLayer = {
        id: newLayerId.toString(),
        type: currentLayer.type,
        x: newLayerPosition.x,
        y: newLayerPosition.y,
        width: currentLayer.width,
        height: currentLayer.height,
        fill: currentLayer.fill,
      };

      addLayer(newLayer);

      if (drawingEdge.ongoing && drawingEdge.lastEdgeId && drawingEdge.fromLayerId) {
        setEdges((prevEdges) =>
          prevEdges.map((edge) =>
            edge.id === drawingEdge.lastEdgeId
              ? {
                ...edge,
                toLayerId: newLayer.id,
                end: newEdgePosition,
                handleStart: position,
                orientation: getOrientationFromPosition(position),
              }
              : edge,
          ),
        );
      }

      setDrawingEdge({ ongoing: false, lastEdgeId: undefined, fromLayerId: undefined });

      setCanvasState({
        mode: CanvasMode.None,
      });
    },
    [addLayer, drawingEdge, layers, setCanvasState, setEdges],
  );

  const translateSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));

      const updatedLayers = selectedLayers.map((layer) => ({
        ...layer,
        x: layer.x + offset.x,
        y: layer.y + offset.y,
      }));

      for (const layer of updatedLayers) {
        if (layer) {
          updateLayer(layer.id, { x: layer.x, y: layer.y });
        }
      }

      // Update all edges
      const updatedEdges = edges.map((edge) => {
        const isSource = selectedLayers.find((layer) => layer.id === edge.fromLayerId);
        const isTarget = selectedLayers.find((layer) => layer.id === edge.toLayerId);

        if (!isSource && !isTarget) {
          return edge;
        }

        const updatedStart = isSource
          ? { ...edge.start, x: edge.start.x + offset.x, y: edge.start.y + offset.y }
          : edge.start;

        const updatedEnd = isTarget ? { ...edge.end, x: edge.end.x + offset.x, y: edge.end.y + offset.y } : edge.end;

        return {
          ...edge,
          start: updatedStart,
          end: updatedEnd,
        };
      });

      // Update the edges state with the updated edges
      setEdges(updatedEdges);

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [activeLayerIDs, canvasState, edges, layers, setCanvasState, setEdges, updateLayer],
  );

  const resizeSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);

      const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));
      const layer = selectedLayers[0];

      if (layer) {
        updateLayer(layer.id, bounds);
      }
    },
    [activeLayerIDs, canvasState, layers, updateLayer],
  );

  const handleResizeHandlePointerDown = useCallback((corner: Side, initialBounds: XYWH) => {
    setCanvasState({
      mode: CanvasMode.Resizing,
      initialBounds,
      corner,
    });
  }, []);

  // ================  LAYERS SELECTIONS  ================== //

  const updateSelectionNet = useCallback(
    (current: Point, origin: Point) => {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(layers, origin, current);

      selectLayer({ userId: currentUserId, layerIds: ids });
    },
    [currentUserId, layers, selectLayer, setCanvasState],
  );

  const startMultiSelection = useCallback(
    (current: Point, origin: Point) => {
      if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
      }
    },
    [setCanvasState],
  );

  const handleUnSelectLayer = useCallback(() => {
    unSelectLayer({ userId: currentUserId });
  }, [currentUserId, unSelectLayer]);

  // ================  DRAWING EDGES  ================== //

  const drawEdgeline = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Edge) return;

      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        setEdges((prevEdges) =>
          prevEdges.map((edge) => (edge.id === drawingEdge.lastEdgeId ? { ...edge, end: point } : edge)),
        );
      }
    },
    [canvasState.mode, drawingEdge, setEdges],
  );

  // ================  SVG POINTER EVENTS  ================== //

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting || canvasState.mode === CanvasMode.Grab) return;

      if (canvasState.mode === CanvasMode.Edge) {
        const selectedLayerId = allActiveLayers[0].layerIds ? allActiveLayers[0].layerIds[0] : "";
        const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
        const HANDLE_DISTANCE = 30;

        if (selectedLayer) {
          // Determine which handle was clicked based on the pointer position
          let handlePosition: HandlePosition;

          if (point.x <= selectedLayer.x) {
            handlePosition = HandlePosition.Left;
          } else if (point.x >= selectedLayer.x + selectedLayer.width) {
            handlePosition = HandlePosition.Right;
          } else if (point.y <= selectedLayer.y) {
            handlePosition = HandlePosition.Top;
          } else {
            handlePosition = HandlePosition.Bottom;
          }

          // Calculate the start point based on the handle position
          let startPoint: Point;

          switch (handlePosition) {
            case HandlePosition.Left:
              startPoint = { x: selectedLayer.x - HANDLE_DISTANCE, y: selectedLayer.y + selectedLayer.height / 2 };
              break;
            case HandlePosition.Right:
              startPoint = {
                x: selectedLayer.x + selectedLayer.width + HANDLE_DISTANCE,
                y: selectedLayer.y + selectedLayer.height / 2,
              };
              break;
            case HandlePosition.Top:
              startPoint = { x: selectedLayer.x + selectedLayer.width / 2, y: selectedLayer.y - HANDLE_DISTANCE };
              break;
            case HandlePosition.Bottom:
              startPoint = {
                x: selectedLayer.x + selectedLayer.width / 2,
                y: selectedLayer.y + selectedLayer.height + HANDLE_DISTANCE,
              };
              break;
          }

          // Create a new edge object
          const newEdge: Edge = {
            id: nanoid().toString(),
            fromLayerId: selectedLayerId,
            toLayerId: "", // Placeholder, replace with actual logic to determine toLayerId
            color: { r: 180, g: 191, b: 204 }, // Placeholder, replace with actual color logic
            thickness: 2,
            start: startPoint,
            end: point,
            orientation: "auto",
            hoverColor: {
              r: 77,
              g: 106,
              b: 255,
            },
          };

          // Update edges state with the new edge
          setEdges((prevEdges) => [...prevEdges, newEdge]);

          // Set drawingEdge state to indicate an edge drawing operation is ongoing
          setDrawingEdge({ ongoing: true, lastEdgeId: newEdge.id, fromLayerId: selectedLayerId });
        }

        return;
      }

      setCanvasState({
        origin: point,
        mode: CanvasMode.Pressing,
      });
    },
    [allActiveLayers, camera, canvasState, layers, setCanvasState, setEdges],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode == CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Edge) {
        drawEdgeline(current);
      }

      socketEmit("cursor-move", {
        roomId: boardId,
        userId: currentUserId,
        cursor: current,
      });
      // setMyPresence({ cursor: current });
    },
    [
      camera,
      canvasState,
      socketEmit,
      boardId,
      currentUserId,
      startMultiSelection,
      updateSelectionNet,
      translateSelectedLayer,
      resizeSelectedLayer,
      drawEdgeline,
    ],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
        handleUnSelectLayer();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Grab) {
        setCanvasState({
          mode: CanvasMode.Grab,
        });
      } else if (canvasState.mode === CanvasMode.Edge) {
        setCanvasState({
          mode: CanvasMode.Edge,
        });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    },
    [camera, canvasState, insertLayer, handleUnSelectLayer, setCanvasState],
  );

  const handlePointerLeave = useCallback(() => {
    // but cursor to null when leaving canvas
    // setMyPresence({ cursor: null });
  }, []);

  // ================  CAMERA FUNCTIONS  ================== //

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isMouseDown || canvasState.mode !== CanvasMode.Grab) return;

      setCamera((prev) => ({
        x: prev.x + event.movementX,
        y: prev.y + event.movementY,
        scale: prev.scale,
      }));

      // Check if the <g> element is out of bounds
      const svgElement = document.querySelector("svg g");

      if (svgElement) {
        const rect = svgElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Check if <g> element is outside the viewport
        const isOutOfBounds =
          rect.top > viewportHeight || rect.right < 0 || rect.bottom < 0 || rect.left > viewportWidth;

        setShowResetButton(isOutOfBounds);
      }
    },
    [isMouseDown, canvasState.mode],
  );

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0 && CanvasMode.Grab) {
      // Check if primary button is pressed
      setIsMouseDown(true);
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const fitView = () => {
    setApplyTransition(true);

    const svgElement = document.querySelector("svg");
    const gElement = document.querySelector("svg g");

    if (!svgElement || !gElement) return;

    const gRect = gElement.getBBox();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const scaleX = (viewportWidth * 0.8) / gRect.width;
    const scaleY = (viewportHeight * 0.8) / gRect.height;

    const scale = Math.min(scaleX, scaleY, 1);

    const translateX = (viewportWidth - gRect.width * scale) / 2 - gRect.x * scale;
    const translateY = (viewportHeight - gRect.height * scale) / 2 - gRect.y * scale;

    setCamera({ x: translateX, y: translateY, scale: scale });

    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  const zoomIn = () => {
    setApplyTransition(true);

    setCamera((prevState) => ({
      ...prevState,
      scale: prevState.scale + 0.1, // Increase scale by 25%
    }));

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  const zoomOut = () => {
    setApplyTransition(true);

    setCamera((prevState) => ({
      ...prevState,
      scale: prevState.scale - 0.1, // Decrease scale by 25%
    }));

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  const resetView = () => {
    // Enable transition
    setApplyTransition(true);

    // Reset camera position
    setCamera({ x: 0, y: 0, scale: 1 });

    // Disable transition after a delay matching the transition duration
    setTimeout(() => {
      setApplyTransition(false);
    }, CANVAS_TRANSITION_TIME);

    setShowResetButton(false);
  };

  // New useEffect hook for canvas mode changes
  useEffect(() => {
    const updateCursorStyle = () => {
      if (canvasState.mode === CanvasMode.Grab) {
        document.body.style.cursor = "grab";
      } else if (canvasState.mode === CanvasMode.Edge) {
        document.body.style.cursor = "cell";
      } else {
        document.body.style.cursor = "default";
      }
    };

    updateCursorStyle();

    // Cleanup function to reset cursor style when component unmounts
    return () => {
      document.body.style.cursor = "default";
    };
  }, [canvasState.mode]);

  // Adjusted keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setCanvasState({
          mode: CanvasMode.Grab,
        });
      }

      if (event.code === "Enter" && canvasState.mode === CanvasMode.Edge) {
        // Reset drawingEdge state when pointer is released
        setDrawingEdge({ ongoing: false });
      }

      if (event.code === "Backspace" && activeLayerIDs?.length > 0 && canvasState.mode !== CanvasMode.Typing) {
        const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));

        handleUnSelectLayer();

        for (const layer of selectedLayers) {
          if (layer) {
            removeLayer(layer.id);
            removeEdgesConnectedToLayer(layer.id);
          }
        }
        // setCanvasState({
        //   mode: CanvasMode.None,
        // });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    activeLayerIDs,
    canvasState,
    layers,
    removeLayer,
    handleUnSelectLayer,
    setCanvasState,
    removeEdgesConnectedToLayer,
  ]);

  // Hande Mouse move
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <main className="h-full w-full relative  touch-none select-none">
      <Toolbar canvasState={canvasState} setCanvasState={setCanvasState} />
      {layers?.length > 0 && (
        <div className="fixed bottom-4 left-4 z-10 space-x-2">
          <figure className="flex items-center space-x-2 float-left">
            <Button variant="outline" onClick={zoomOut}>
              -
            </Button>
            <p className="text-sm">{Math.round(camera.scale * 100)}%</p>
            <Button variant="outline" onClick={zoomIn}>
              +
            </Button>
          </figure>
          <Button variant="outline" onClick={fitView}>
            Reset content
          </Button>
        </div>
      )}
      {showResetButton && (
        <Button variant="outline" onClick={resetView} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
          Scroll back to content
        </Button>
      )}
      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      <svg
        className="h-[100vh] w-[100vw]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
            transformOrigin: "center",
            transition: applyTransition ? `transform ${CANVAS_TRANSITION_TIME / 1000}s ease-out` : "none",
          }}
        >
          {layers?.map((layer) => (
            <LayerPreview
              key={layer.id}
              layer={layer}
              onLayerPointerDown={(e, layerId, origin) => handleLayerPointerDown(e, layerId, origin!)}
              selectionColor={layerIdsToColorSelection[layer.id]}
            />
          ))}
          {edges.map((edge) => {
            const [controlPoint1, controlPoint2] = calculateControlPoints(edge.start, edge.end, edge.handleStart);
            const isHovered = edge.id === hoveredEdgeId;
            const pathString = `M${edge.start.x} ${edge.start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${edge.end.x} ${edge.end.y}`;

            return (
              <g key={edge.id}>
                <path
                  d={pathString}
                  stroke={colorToCss(isHovered ? edge.hoverColor : edge.color)}
                  strokeWidth={edge.thickness}
                  markerEnd={`url(#arrowhead-${edge.id})`}
                  fill="transparent"
                />
                <path
                  d={pathString}
                  stroke="transparent"
                  strokeWidth={40}
                  fill="transparent"
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                  style={{ cursor: "pointer" }}
                />
                <marker
                  key={`arrow-${edge.id}`}
                  id={`arrowhead-${edge.id}`}
                  markerWidth={ARROW_SIZE}
                  markerHeight={ARROW_SIZE}
                  refX={ARROW_SIZE / 4}
                  refY={ARROW_SIZE / 2}
                  orient={edge.orientation}
                >
                  <polygon
                    points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
                    fill={colorToCss(isHovered ? edge.hoverColor : edge.color)}
                  />
                </marker>
              </g>
            );
          })}
          <SelectionBox onResizeHandlePointerDown={handleResizeHandlePointerDown} />
          <LayerHandles
            onMouseEnter={onHandleMouseEnter}
            onMouseLeave={onHandleMouseLeave}
            // onHandleClick={handleHandleClick}
            onPointerDown={onHandleMouseDown}
            onPointerUp={onHandleMouseUp}
          />
          {canvasState.mode === CanvasMode.SelectionNet && canvasState.current && (
            <rect
              className="fill-blue-500/5 stroke-blue-500 stroke-1"
              x={Math.min(canvasState.origin.x, canvasState.current.x)}
              y={Math.min(canvasState.origin.y, canvasState.current.y)}
              width={Math.abs(canvasState.origin.x - canvasState.current.x)}
              height={Math.abs(canvasState.origin.y - canvasState.current.y)}
            />
          )}
          <CursorPresence />
        </g>
      </svg>
    </main>
  );
};

export { Whiteboard };
