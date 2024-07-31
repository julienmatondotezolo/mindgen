/* eslint-disable no-unused-vars */
// src/components/Canvas.tsx
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
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
  boardIdState,
  canvasStateAtom,
  currentUserState,
  hoveredLayerIdAtomState,
  layerAtomState,
  useAddElement,
  useRemoveElement,
  usernameState,
  useSelectElement,
  useUnSelectElement,
  useUpdateElement,
} from "@/state";
import {
  colorToCss,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
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

  const setHoveredLayerID = useSetRecoilState(hoveredLayerIdAtomState);

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
      setHoveredLayerID(layerId);
      setShowLayerAddButtons(true);

      setCanvasState({
        mode: CanvasMode.None,
      });
    },
    [addLayer, currentUserId, layers, selectLayer, setCanvasState, setHoveredLayerID],
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

        console.log("ids:", ids);

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

  const handleLayerMouseEnter = useCallback(
    (e: React.MouseEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Grab ||
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting ||
        activeLayerIDs?.length > 0
      ) {
        return;
      }

      e.stopPropagation();

      // Do something
      setHoveredLayerID(layerId);
      setShowLayerAddButtons(true);

      // setCanvasState({
      //   mode: CanvasMode.None,
      // });
    },
    [activeLayerIDs, canvasState, setHoveredLayerID],
  );

  const handleLayerMouseLeave = useCallback(
    (mouseEvent: React.MouseEvent) => {
      if (
        canvasState.mode === CanvasMode.Grab ||
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting ||
        activeLayerIDs?.length > 0
      ) {
        return;
      }

      setHoveredLayerID("");
      setShowLayerAddButtons(false);

      // setCanvasState({
      //   mode: CanvasMode.None,
      // });
    },
    [activeLayerIDs, canvasState, setHoveredLayerID],
  );

  const handleHandleClick = useCallback(
    (layerId: String, position: HandlePosition) => {
      const currentLayer = layers.find((layer) => layer.id === layerId);

      if (!currentLayer) {
        console.error("Layer not found");
        return;
      }

      // Calculate the new position based on the clicked handle's position
      let newLayerPosition: Point;

      switch (position) {
        case HandlePosition.Left:
          newLayerPosition = { x: currentLayer.x - currentLayer.width - 100, y: currentLayer.y };
          break;
        case HandlePosition.Top:
          newLayerPosition = { x: currentLayer.x, y: currentLayer.y - currentLayer.height - 100 };
          break;
        case HandlePosition.Right:
          newLayerPosition = { x: currentLayer.x + currentLayer.width + 100, y: currentLayer.y };
          break;
        case HandlePosition.Bottom:
          newLayerPosition = { x: currentLayer.x, y: currentLayer.y + currentLayer.height + 100 };
          break;
        default:
          console.error("Invalid position");
          return;
      }

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
    },
    [addLayer, layers],
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

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [activeLayerIDs, canvasState, layers, setCanvasState, updateLayer],
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

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const handleUnSelectLayer = useCallback(() => {
    unSelectLayer({ userId: currentUserId });
  }, [currentUserId, unSelectLayer]);

  // ================  SVG POINTER EVENTS  ================== //

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting || canvasState.mode === CanvasMode.Grab) return;

      setCanvasState({
        origin: point,
        mode: CanvasMode.Pressing,
      });
    },
    [camera, canvasState.mode, setCanvasState],
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
      } else if (canvasState.mode === CanvasMode.Pencil) {
        //
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
      } else if (canvasState.mode === CanvasMode.Pencil) {
        // continueDrawing(current, e);
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
    ],
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

  // Fit content to view
  const fitView = () => {
    // Enable transition
    setApplyTransition(true);

    const svgElement = document.querySelector("svg");
    const gElement = document.querySelector("svg g");

    if (!svgElement || !gElement) return;

    const svgRect = svgElement.getBoundingClientRect();
    const gRect = gElement.getBBox(); // getBBox() returns the tight bounding box in local coordinates

    const gRectWidth = gRect.width - gRect.x;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    const gRectHeight = gRect.height - gRect.y;

    // Calculate scale to fit horizontally
    const scaleX = 0;
    const scaleY = 0;

    const scale = Math.max(scaleX, scaleY); // Use max to ensure content doesn't shrink vertically

    // Calculate translation to center the content horizontally
    const translateX = 0;
    const translateY = 0;

    setCamera({ x: 0, y: 0, scale: 1 });

    // Disable transition after a delay matching the transition duration
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

      if (event.code === "Backspace" && activeLayerIDs?.length > 0 && canvasState.mode !== CanvasMode.Typing) {
        const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));

        handleUnSelectLayer();

        for (const layer of selectedLayers) {
          if (layer) {
            removeLayer(layer.id);
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
  }, [activeLayerIDs, canvasState, layers, removeLayer, handleUnSelectLayer, setCanvasState]);

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
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
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
              onLayerMouseEnter={handleLayerMouseEnter}
              onLayerMouseLeave={handleLayerMouseLeave}
              selectionColor={layerIdsToColorSelection[layer.id]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={handleResizeHandlePointerDown} />
          {showLayerAddButtons && activeLayerIDs?.length <= 1 && <LayerHandles onHandleClick={handleHandleClick} />}
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
