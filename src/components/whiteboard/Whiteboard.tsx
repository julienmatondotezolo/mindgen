/* eslint-disable prettier/prettier */
import html2canvas from 'html2canvas';
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from 'react-query';
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { updateMindmapById } from '@/_services/mindgen/mindgenService';
import {
  Camera,
  CanvasMode,
  Color,
  Edge,
  EdgeType,
  HandlePosition,
  Layer,
  LayerType,
  MindMapDetailsProps,
  Organization,
  Point,
  Side,
  XYWH,
} from "@/_types";
import { useSocket } from "@/hooks";
import {
  activeEdgeIdAtom,
  activeLayersAtom,
  canvasStateAtom,
  connectedUsersState,
  edgesAtomState,
  hoveredEdgeIdAtom,
  isEdgeNearLayerAtom,
  layerAtomState,
  nearestLayerAtom,
  selectedOrganizationState,
  useAddEdgeElement,
  useAddElement,
  useRemoveEdge,
  useRemoveElement,
  useSelectEdgeElement,
  useSelectElement,
  useUnSelectEdgeElement,
  useUnSelectElement,
  useUpdateEdge,
  useUpdateElement,
} from "@/state";
import {
  calculateNewLayerPositions,
  connectionIdToColor,
  emptyMindMapObject,
  findIntersectingLayersWithRectangle,
  findNearestLayerHandle,
  getHandlePosition,
  getLayerById,
  getOrientationFromPosition,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/utils";

import { Button } from "../ui";
import { CursorPresence } from "./collaborate";
import { EdgePreview, EdgeSelectionBox, EdgeSelectionTools, ShadowEdge } from "./edges";
import { LayerHandles, SelectionBox, SelectionTools, ShadowLayer } from "./layers";
import { LayerPreview } from "./layers/LayerPreview";

const Whiteboard = ({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps }) => {
  const DEBUG_MODE = false;
  const { theme } = useTheme();
  const boardId = userMindmapDetails.id;

  const whiteboardText = useTranslations("Whiteboard");
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);

  const [pictureUrl, setPictureUrl] = useState("");
  const [isMouseDown, setIsMouseDown] = useState(false);

  const [showResetButton, setShowResetButton] = useState(false);
  const [applyTransition, setApplyTransition] = useState(false);

  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  const [, setLastUsedColor] = useState<Color>({
    r: 50,
    g: 20,
    b: 188,
  });

  const MAX_LAYERS = 100;

  const CANVAS_TRANSITION_TIME = 500;

  const ids: string[] = useMemo(() => [], []);

  // ================  SOCKETS  ================== //

  const { socketEmit } = useSocket();
  const session: any = useSession();
  const currentUserId = session.data?.session?.user?.id;

  // ================  SHADOW EDGE & LAYER STATE  ================== //

  const [layers, setLayers] = useRecoilState(layerAtomState);
  const [edges, setEdges] = useRecoilState(edgesAtomState);

  const [shadowState, setShadowState] = useState<{
    showShadow: boolean;
    startPosition: Point | null;
    fromHandlePosition: HandlePosition | undefined;
    layerPosition: Point | null;
    edgePosition: Point | null;
    layer: Layer | null;
  }>({
    showShadow: false,
    startPosition: null,
    fromHandlePosition: undefined,
    layerPosition: null,
    edgePosition: null,
    layer: null,
  });

  // ================  USE QUERY & SAVE MINDMAPS  ================== //

  const queryClient = useQueryClient();

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const updateMindmapMutation = useMutation(updateMindmapById, {
    onSuccess: () => {
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("mindmaps");
    },
  });

  const takeScreenshot = useCallback(async () => {
    const canvasElement = document.getElementById('canvas');

    if (canvasElement) {
      canvasElement.style.color = "white";
      canvasElement.style.fontFamily = 'sans-serif';
      canvasElement.style.backgroundColor = theme === "dark" ? "#050713" : "#fdfdff";

      const canvas = await html2canvas(canvasElement);
      const base64Image = canvas.toDataURL("image/png");

      canvasElement.style.backgroundColor = 'transparent';

      setPictureUrl(base64Image);
    }
  }, [theme]);

  const saveMindmap = useCallback(() => {
    const newMindmapObject = emptyMindMapObject({
      name: userMindmapDetails.name,
      description: userMindmapDetails.description,
      layers,
      edges,
      organizationId: selectedOrga!.id,
      visibility: userMindmapDetails.visibility,
      pictureUrl: pictureUrl, 
    });

    updateMindmapMutation.mutate({
      session: session,
      mindmapId: userMindmapDetails.id,
      mindmapObject: newMindmapObject,
    });
  }, [edges, layers, pictureUrl, selectedOrga, session, updateMindmapMutation, userMindmapDetails]);

  // useEffect(() => {
  //   takeScreenshot(); // Run on the first render only
  // });

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     saveMindmap();
  //   }, 10000); // 10 seconds

  //   return () => clearInterval(intervalId); // Cleanup on unmount
  // }, [saveMindmap]);

  // ================  CONSTANT LAYERS  ================== //

  const allActiveLayers: any = useRecoilValue(activeLayersAtom);
  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer: any) => userActiveLayer.userId === currentUserId)
    .map((item: any) => item.layerIds)[0];

  const connectedUsers = useRecoilValue(connectedUsersState);

  const allOtherUsers = connectedUsers.filter((item) => item.id !== currentUserId);
  const allOtherUserSelection = allActiveLayers.filter((activeLyers: any) => activeLyers.userId !== currentUserId);

  // Create a Map to store selections for quick lookup
  const selectionMap = new Map();

  // Populate the selectionMap
  allOtherUserSelection.forEach((selection: any) => {
    selectionMap.set(selection.userId, selection.layerIds);
  });

  // Merge users with their selections
  const otherUserSelections: any = allOtherUsers.map((user) => ({
    ...user,
    layerIds: selectionMap.get(user.id) || [],
  }));

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const userSelection of otherUserSelections) {
      for (const layerId of userSelection.layerIds) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(userSelection.socketIndex);
      }
    }

    return layerIdsToColorSelection;
  }, [otherUserSelections]);

  const selectLayer = useSelectElement({ roomId: boardId });
  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const addLayer = useAddElement({ roomId: boardId });
  const updateLayer = useUpdateElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });

  // ================  CONSTANT EDGES  ================== //

  const allActiveEdges: any = useRecoilValue(activeEdgeIdAtom);
  const activeEdgeId = allActiveEdges
    .filter((userActiveEdge: any) => userActiveEdge.userId === currentUserId)
    .map((item: any) => item.edgeIds)[0];

  const allOtherUserEdgeSelection = allActiveEdges.filter((activeEdges: any) => activeEdges.userId !== currentUserId);

  // Create a Map to store selections for quick lookup
  const selectionEdgesMap = new Map();

  // Populate the selectionMap
  allOtherUserEdgeSelection.forEach((selection: any) => {
    selectionEdgesMap.set(selection.userId, selection.edgeIds);
  });

  // Merge users with their selections
  const otherUserEdgeSelections: any = allOtherUsers.map((user) => ({
    ...user,
    edgeIds: selectionEdgesMap.get(user.id) || [],
  }));

  const edgeIdsToColorSelection = useMemo(() => {
    const edgeIdsToColorSelection: Record<string, string> = {};

    for (const userSelection of otherUserEdgeSelections) {
      for (const edgeId of userSelection.edgeIds) {
        edgeIdsToColorSelection[edgeId] = connectionIdToColor(userSelection.socketIndex);
      }
    };

    return edgeIdsToColorSelection;
  }, [otherUserEdgeSelections]);
    
  const selectEdge = useSelectEdgeElement({ roomId: boardId });
  const unSelectEdge = useUnSelectEdgeElement({ roomId: boardId });
  const addEdge = useAddEdgeElement({ roomId: boardId });
  const updateEdge = useUpdateEdge({ roomId: boardId });
  const removeEdge = useRemoveEdge({ roomId: boardId });

  const [hoveredEdgeId, setHoveredEdgeId] = useRecoilState(hoveredEdgeIdAtom);
  // const [activeEdgeId, setActiveEdgeId] = useRecoilState(activeEdgeIdAtom);

  const setIsEdgeNearLayer = useSetRecoilState(isEdgeNearLayerAtom);
  const setNearestLayer = useSetRecoilState(nearestLayerAtom);

  const [drawingEdge, setDrawingEdge] = useState<{
    ongoing: boolean;
    lastEdgeId?: string;
    fromHandlePosition?: HandlePosition;
    fromLayerId?: string;
    endPoint?: Point;
  }>({
    ongoing: false,
  });

  const ARROW_SIZE = 5;

  // ================  LAYERS  ================== //

  const insertLayer = useCallback(
    (layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Note | LayerType.Path, position: Point) => {
      if (layers?.length >= MAX_LAYERS) {
        return;
      }

      const layerId = nanoid();

      const newLayer: any = {
        id: layerId.toString() + layers.length,
        type: layerType,
        x: position.x,
        y: position.y,
        width: layerType === LayerType.Rectangle ? 200 : 150,
        height: layerType === LayerType.Rectangle ? 60 : 150,
        fill: { r: 77, g: 106, b: 255 },
        value: whiteboardText("typeSomething"),
      };

      addLayer({ layer: newLayer, userId: currentUserId });

      selectLayer({ userId: currentUserId, layerIds: [newLayer.id] });

      setCanvasState({
        mode: CanvasMode.None,
      });
    },
    [addLayer, currentUserId, layers, selectLayer, setCanvasState, whiteboardText],
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

      const isAlreadySelected = allOtherUserSelection.some((otherUser: any) => {
        if (otherUser.layerIds) {
          return otherUser.layerIds.includes(layerId);
        }
      });

      if (isAlreadySelected) return;

      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera, svgRef.current);

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
        unSelectEdge({ userId: currentUserId });
      }

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
        initialLayerBounds: getLayerById({ layerId, layers }),
      });
    },
    [
      canvasState.mode,
      allOtherUserSelection,
      camera,
      activeLayerIDs,
      setCanvasState,
      layers,
      ids,
      selectLayer,
      currentUserId,
      unSelectEdge,
    ],
  );

  const onHandleMouseEnter = useCallback(
    (event: React.MouseEvent, layerId: string, position: HandlePosition) => {
      if (canvasState.mode === CanvasMode.EdgeDrawing || canvasState.mode === CanvasMode.SelectionNet) return;

      const currentLayer = layers.find((layer) => layer.id === layerId);
      const LAYER_SPACING = 150; // Adjust this value to control the space between layers
      const HANDLE_DISTANCE = 20;

      if (!currentLayer) {
        console.error("Layer not found");
        return;
      }

      const startPoint = getHandlePosition(currentLayer, position);

      const { newLayerPosition, newEdgePosition } = calculateNewLayerPositions(
        currentLayer,
        position,
        LAYER_SPACING,
        HANDLE_DISTANCE,
      );

      // Find a non-overlapping position for the new layer
      // const adjustedPosition = findNonOverlappingPosition({
      //   newPosition: newLayerPosition,
      //   layers,
      //   currentLayer,
      //   LAYER_SPACING,
      // });

      setShadowState({
        showShadow: true,
        startPosition: startPoint,
        fromHandlePosition: position,
        layerPosition: newLayerPosition,
        edgePosition: newEdgePosition,
        layer: currentLayer,
      });

      setCanvasState({
        mode: CanvasMode.Edge,
      });
    },
    [canvasState.mode, layers, setCanvasState],
  );

  const onHandleMouseLeave = useCallback(() => {
    if (
      canvasState.mode === CanvasMode.EdgeDrawing ||
      canvasState.mode === CanvasMode.SelectionNet ||
      drawingEdge.ongoing
    )
      return;

    setShadowState({
      showShadow: false,
      startPosition: null,
      fromHandlePosition: undefined,
      layerPosition: null,
      edgePosition: null,
      layer: null,
    });

    setCanvasState({
      mode: CanvasMode.None,
    });
  }, [canvasState, drawingEdge, setCanvasState]);

  const onHandleMouseDown = useCallback(
    (e: React.PointerEvent, layerId: string, position: HandlePosition) => {
      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        // updateEdge(drawingEdge.lastEdgeId, { fromLayerId: layerId });

        updateEdge({
          id: drawingEdge.lastEdgeId,
          userId: currentUserId,
          updatedElementEdge: { fromLayerId: layerId },
        });

        setDrawingEdge(
          (prev) => (
            { ...prev, fromLayerId: layerId, fromHandlePosition: position }
          )
        );
      }
    },
    [currentUserId, drawingEdge, updateEdge],
  );

  const onHandleMouseUp = useCallback(
    (layerId: String, position: HandlePosition) => {
      if (canvasState.mode === CanvasMode.EdgeEditing) return;

      const currentLayer = layers.find((layer) => layer.id === layerId);
      const LAYER_SPACING = 150; // Value to control the space between layers
      const HANDLE_DISTANCE = 20;

      if (!currentLayer) {
        console.error("Layer not found");
        return;
      }

      // Calculate the new position based on the clicked handle's position
      const { newLayerPosition, newEdgePosition } = calculateNewLayerPositions(
        currentLayer,
        position,
        LAYER_SPACING,
        HANDLE_DISTANCE,
      );

      // // Find a non-overlapping position for the new layer
      // const adjustedPosition = findNonOverlappingPosition({
      //   newPosition: newLayerPosition,
      //   layers,
      //   currentLayer,
      //   LAYER_SPACING,
      // });

      const newLayerId = nanoid();

      const newLayer: any = {
        id: newLayerId.toString(),
        type: currentLayer.type,
        x: newLayerPosition.x,
        y: newLayerPosition.y,
        width: currentLayer.width,
        height: currentLayer.height,
        fill: currentLayer.fill,
        value: whiteboardText("addLayerPlaceHolder"),
      };

      addLayer({ layer: newLayer, userId: currentUserId });

      selectLayer({ userId: currentUserId, layerIds: [newLayer.id] });

      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        updateEdge({
          id: drawingEdge.lastEdgeId,
          userId: currentUserId,
          updatedElementEdge: {
            toLayerId: newLayer.id,
            end: newEdgePosition,
            handleStart: position,
            orientation: getOrientationFromPosition(position),
          },
        });
      }

      setDrawingEdge({ ongoing: false, lastEdgeId: undefined, fromLayerId: undefined, fromHandlePosition: undefined });

      setCanvasState({
        mode: CanvasMode.None,
      });
    },
    [
      addLayer,
      canvasState,
      currentUserId,
      drawingEdge,
      layers,
      selectLayer,
      setCanvasState,
      updateEdge,
      whiteboardText,
    ],
  );

  const translateSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (activeLayerIDs?.includes(layer.id)) {
            return {
              ...layer,
              x: layer.x + offset.x,
              y: layer.y + offset.y,
            };
          }
          return layer;
        }),
      );

      // Update all edges
      const updatedEdges = edges.map((edge) => {
        const isSource = activeLayerIDs?.includes(edge.fromLayerId);
        const isTarget = activeLayerIDs?.includes(edge.toLayerId);

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
        initialLayerBounds: getLayerById({ layerId: "_", layers }),
        current: point,
      });
    },
    [canvasState, setLayers, edges, setEdges, setCanvasState, layers, activeLayerIDs],
  );

  const resizeSelectedLayer = useCallback(
    (point: Point, isShiftPressed: boolean) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      // const HANDLE_DISTANCE = 30;
      const MIN_WIDTH = 100; // Minimum width in pixels
      const MIN_HEIGHT = 50; // Minimum height in pixels

      const initialBounds = canvasState.initialBounds;
      let newBounds = resizeBounds(initialBounds, canvasState.corner, point);

      setLayers((prevLayers) =>
        prevLayers.map((layer) => {
          if (!activeLayerIDs?.includes(layer.id)) {
            return layer;
          }

          // Shift key is pressed, maintain aspect ratio
          if (isShiftPressed) {
            // Calculate aspect ratio
            const aspectRatio = initialBounds.width / initialBounds.height;

            // Determine which dimension to adjust based on which changed more
            const widthChange = Math.abs(newBounds.width - initialBounds.width);
            const heightChange = Math.abs(newBounds.height - initialBounds.height);

            if (widthChange > heightChange) {
              newBounds.height = newBounds.width / aspectRatio;
            } else {
              newBounds.width = newBounds.height * aspectRatio;
            }

            // Adjust position if resizing from top or left
            if (canvasState.corner & Side.Left) {
              newBounds.x = initialBounds.x + initialBounds.width - newBounds.width;
            }
            if (canvasState.corner & Side.Top) {
              newBounds.y = initialBounds.y + initialBounds.height - newBounds.height;
            }
          }

          // Prevent resizing below minimum dimensions
          if (newBounds.width < MIN_WIDTH) {
            if (canvasState.corner & Side.Left) {
              newBounds.x = initialBounds.x + initialBounds.width - MIN_WIDTH;
            }
            newBounds.width = MIN_WIDTH;
          }
          if (newBounds.height < MIN_HEIGHT) {
            if (canvasState.corner & Side.Top) {
              newBounds.y = initialBounds.y + initialBounds.height - MIN_HEIGHT;
            }
            newBounds.height = MIN_HEIGHT;
          }

          return { ...layer, ...newBounds };
        }),
      );

      // Update connected edges
      const updatedEdges = edges.map((edge) => {
        const isSource = activeLayerIDs?.includes(edge.fromLayerId);
        const isTarget = activeLayerIDs?.includes(edge.toLayerId);

        if (!isSource && !isTarget) {
          return edge;
        }

        let updatedStart = edge.start;
        let updatedEnd = edge.end;

        if (isSource) {
          updatedStart = getHandlePosition(newBounds, edge.handleStart);
        }

        if (isTarget) {
          updatedEnd = getHandlePosition(newBounds, edge.handleEnd);
        }

        return {
          ...edge,
          start: updatedStart,
          end: updatedEnd,
        };
      });

      // Update the edges state with the updated edges
      setEdges(updatedEdges);
    },
    [activeLayerIDs, canvasState, edges, setLayers, setEdges],
  );

  const handleResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [setCanvasState],
  );

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

  const sortLayersBySelection = useCallback(
    (layersToSort: Layer[]) => {
      if (!Array.isArray(layersToSort)) {
        console.error('layersToSort is not an array:', layersToSort);
        return [layersToSort];
      }

      return [...layersToSort].sort((a, b) => {
        if (!a || !b) {
          console.error('Invalid layer object:', { a, b });
          return 0;
        }

        const aSelected = activeLayerIDs?.includes(a.id) ? 1 : 0;
        const bSelected = activeLayerIDs?.includes(b.id) ? 1 : 0;

        return aSelected - bSelected; // Changed to sort selected layers first
      });
    },
    [activeLayerIDs],
  );

  // ================  EDGES  ================== //

  const removeEdgesConnectedToLayer = useCallback(
    (layerId: string) => {
      edges.forEach((edge) => {
        if (edge.fromLayerId === layerId || edge.toLayerId === layerId) {
          removeEdge({
            id: edge.id,
            userId: currentUserId,
          });
        }
      });
    },
    [currentUserId, edges, removeEdge],
  );

  const handleEdgeHandlePointerDown = useCallback(
    (position: "START" | "MIDDLE" | "END", point: Point) => {
      if(activeEdgeId[0])
        setCanvasState({
          mode: CanvasMode.EdgeEditing,
          editingEdge: {
            id: activeEdgeId[0],
            handlePosition: position,
            startPoint: point,
          },
        });
    },
    [setCanvasState, activeEdgeId],
  );

  const updateEdgePosition = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.EdgeEditing || !canvasState.editingEdge) return;

      const { id, handlePosition, startPoint } = canvasState.editingEdge;
      const edge = edges.find((e) => e.id === id);

      // Check if edge is undefined
      if (!edge) {
        return; // Exit the function if edge is not found
      }

      const dx = point.x - startPoint.x;
      const dy = point.y - startPoint.y;

      let updatedEdge: Edge;

      const snapThreshold = 20;
      const layerThreshold = 80;

      // Exclude the layer we're dragging from
      const filteredLayers = layers.filter((layer) => layer.id !== drawingEdge.fromLayerId);

      const nearestHandle = findNearestLayerHandle(point, filteredLayers, snapThreshold);
      const nearestLayer = findNearestLayerHandle(point, filteredLayers, layerThreshold);

      setIsEdgeNearLayer(!nearestHandle);
      setNearestLayer(nearestLayer ? layers.find((layer) => layer.id === nearestLayer.layerId) || null : null);

      // Set drawingEdge state to indicate an edge drawing operation is ongoing
      setDrawingEdge({ ongoing: true, lastEdgeId: id, fromLayerId: edge.fromLayerId });

      let controlPoint1, controlPoint2;

      switch (handlePosition) {
        case "START":
          if (nearestHandle && nearestHandle.layerId !== edge.toLayerId) {
            updatedEdge = {
              ...edge,
              start: { x: nearestHandle.x, y: nearestHandle.y },
              fromLayerId: nearestHandle.layerId,
              handleStart: nearestHandle.position,
            };
          } else {
            updatedEdge = {
              ...edge,
              start: point,
              fromLayerId: undefined,
              handleStart: edge.handleStart,
            };
          }
          break;
        case "END":
          if (nearestHandle && nearestHandle.layerId !== edge.fromLayerId) {
            updatedEdge = {
              ...edge,
              end: { x: nearestHandle.x, y: nearestHandle.y },
              toLayerId: nearestHandle.layerId,
              handleEnd: nearestHandle.position,
              orientation: getOrientationFromPosition(nearestHandle.position, true),
            };
          } else {
            updatedEdge = {
              ...edge,
              end: point,
              toLayerId: undefined,
              handleEnd: edge.handleEnd,
              orientation: edge.orientation,
            };
          }
          break;
        case "MIDDLE":
          controlPoint1 = edge.controlPoint1 || {
            x: edge.start.x + (edge.end.x - edge.start.x) / 3,
            y: edge.start.y + (edge.end.y - edge.start.y) / 3,
          };
          controlPoint2 = edge.controlPoint2 || {
            x: edge.start.x + (2 * (edge.end.x - edge.start.x)) / 3,
            y: edge.start.y + (2 * (edge.end.y - edge.start.y)) / 3,
          };

          updatedEdge = {
            ...edge,
            controlPoint1: { x: controlPoint1.x + dx, y: controlPoint1.y + dy },
            controlPoint2: { x: controlPoint2.x + dx, y: controlPoint2.y + dy },
          };
          break;
      }

      setEdges(edges.map((e) => (e.id === id ? updatedEdge : e)));
      setCanvasState({
        ...canvasState,
        editingEdge: { ...canvasState.editingEdge, startPoint: point },
      });
    },
    [canvasState, edges, layers, setIsEdgeNearLayer, setNearestLayer, setEdges, setCanvasState, drawingEdge],
  );

  const handleEdgeClick = useCallback(
    (e: React.PointerEvent, edgeId: string) => {
      const isAlreadySelected = allOtherUserEdgeSelection.some((otherUser: any) => {
        if (otherUser.edgeIds) {
          return otherUser.edgeIds.includes(edgeId);
        }
      });

      if (isAlreadySelected) return;

      e.stopPropagation();

      selectEdge({ userId: currentUserId, edgeIds: [edgeId] });
      setHoveredEdgeId(null);
      handleUnSelectLayer();
      setCanvasState({
        mode: CanvasMode.EdgeActive,
      });
    },
    [allOtherUserEdgeSelection, currentUserId, handleUnSelectLayer, selectEdge, setCanvasState, setHoveredEdgeId],
  );

  // ================  DRAWING EDGES  ================== //

  const drawEdgeline = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Edge && canvasState.mode == CanvasMode.EdgeActive) return;

      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        handleUnSelectLayer();

        setShadowState({
          showShadow: false,
          startPosition: null,
          fromHandlePosition: undefined,
          layerPosition: null,
          edgePosition: null,
          layer: null,
        });

        const lastUpdatedEdge = edges.find((edge) => edge.id === drawingEdge.lastEdgeId);

        if (!lastUpdatedEdge) return;

        selectEdge({ userId: currentUserId, edgeIds: [lastUpdatedEdge.id] });

        let updatedEdge: Edge;

        const snapThreshold = 20;
        const layerThreshold = 80;

        // Exclude the layer we're dragging from
        const filteredLayers = layers.filter((layer) => layer.id !== drawingEdge.fromLayerId);

        // const drawingFromLayer = layers.find((layer) => layer.id === drawingEdge.fromLayerId);

        // if (drawingFromLayer && drawingEdge.fromHandlePosition) {
        //   const { newLayerPosition } = calculateNewLayerPositions(
        //     drawingFromLayer,
        //     drawingEdge.fromHandlePosition,
        //     150, // LAYER_SPACING
        //     20, // HANDLE_DISTANCE
        //     point,
        //   );

        //   setShadowState({
        //     showShadow: true,
        //     startPosition: null,
        //     fromHandlePosition: lastUpdatedEdge.handleStart,
        //     layerPosition: newLayerPosition,
        //     edgePosition: null,
        //     layer: drawingFromLayer,
        //   });
        // }

        const nearestHandle = findNearestLayerHandle(point, filteredLayers, snapThreshold);
        const nearestLayer = findNearestLayerHandle(point, filteredLayers, layerThreshold);

        setIsEdgeNearLayer(!nearestHandle);
        setNearestLayer(
          nearestLayer ? filteredLayers.find((layer) => layer.id === nearestLayer.layerId) || null : null,
        );

        setDrawingEdge({
          ...drawingEdge,
          endPoint: point,
        });

        if (nearestHandle && nearestHandle.layerId !== lastUpdatedEdge.fromLayerId) {
          updatedEdge = {
            ...lastUpdatedEdge,
            end: { x: nearestHandle.x, y: nearestHandle.y },
            toLayerId: nearestHandle.layerId,
            handleEnd: nearestHandle.position,
            orientation: getOrientationFromPosition(nearestHandle.position, true),
          };
        } else {
          updatedEdge = {
            ...lastUpdatedEdge,
            end: point,
            toLayerId: undefined,
            handleEnd: lastUpdatedEdge.handleEnd,
            orientation: lastUpdatedEdge.orientation,
          };
        }

        setEdges(edges.map((e) => (e.id === drawingEdge.lastEdgeId ? updatedEdge : e)));
        setCanvasState({
          mode: CanvasMode.EdgeDrawing,
        });
      }
    },
    [canvasState.mode, drawingEdge, handleUnSelectLayer, edges, selectEdge, currentUserId, layers, setIsEdgeNearLayer, setNearestLayer, setEdges, setCanvasState],
  );

  // ================  SVG POINTER EVENTS  ================== //

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera, svgRef.current);

      if (canvasState.mode === CanvasMode.Inserting || canvasState.mode === CanvasMode.Grab) {
        return;
      } else if (canvasState.mode === CanvasMode.Resizing) {
        // If we're already in resizing mode, do nothing
        return;
      } else if (canvasState.mode === CanvasMode.Edge) {
        const selectedLayer = layers.find((layer) => activeLayerIDs?.includes(layer.id));

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
          const startPoint = shadowState.startPosition;

          // Create a new edge object
          const newEdge: Edge = {
            id: nanoid().toString(),
            fromLayerId: selectedLayer.id,
            toLayerId: "",
            color: { r: 180, g: 191, b: 204 }, // Placeholder, replace with actual color logic
            thickness: 2,
            start: startPoint ?? point,
            handleStart: handlePosition,
            end: point,
            orientation: "auto",
            hoverColor: {
              r: 77,
              g: 106,
              b: 255,
            },
            type: EdgeType.Solid,
          };

          // Update edges state with the new edge
          addEdge({ edge: newEdge, userId: currentUserId });

          // Set drawingEdge state to indicate an edge drawing operation is ongoing
          setDrawingEdge({ ongoing: true, lastEdgeId: newEdge.id, fromLayerId: selectedLayer.id });

          unSelectEdge({ userId: currentUserId });
          
        } else {
          // Create a new edge object
          const newEdge: Edge = {
            id: nanoid().toString(),
            fromLayerId: "",
            toLayerId: "",
            color: { r: 180, g: 191, b: 204 }, // Placeholder, replace with actual color logic
            thickness: 2,
            start: point,
            end: point,
            orientation: "auto",
            hoverColor: {
              r: 77,
              g: 106,
              b: 255,
            },
            type: EdgeType.Solid,
          };

          // Update edges state with the new edge
          addEdge({ edge: newEdge, userId: currentUserId });

          // Set drawingEdge state to indicate an edge drawing operation is ongoing
          setDrawingEdge({ ongoing: true, lastEdgeId: newEdge.id, fromLayerId: undefined });
        }

        return;
      } else if (canvasState.mode === CanvasMode.EdgeActive) {
        unSelectEdge({ userId: currentUserId });
        setHoveredEdgeId(null);
      } else if (canvasState.mode === CanvasMode.Typing) {
        return;
      } else {
        setCanvasState({
          origin: point,
          mode: CanvasMode.Pressing,
        });
      }
    },
    [camera, canvasState.mode, layers, activeLayerIDs, shadowState.startPosition, addEdge, currentUserId, unSelectEdge, setHoveredEdgeId, setCanvasState],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera, svgRef.current);

      if (canvasState.mode == CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current, e.shiftKey);
      } else if (canvasState.mode === CanvasMode.Edge || canvasState.mode == CanvasMode.EdgeDrawing) {
        drawEdgeline(current);
      } else if (canvasState.mode === CanvasMode.EdgeEditing) {
        updateEdgePosition(current);
      }

      if (userMindmapDetails.members.length > 1)
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
      userMindmapDetails.members.length,
      socketEmit,
      boardId,
      currentUserId,
      startMultiSelection,
      updateSelectionNet,
      translateSelectedLayer,
      resizeSelectedLayer,
      drawEdgeline,
      updateEdgePosition,
    ],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera, svgRef.current);

      if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
        handleUnSelectLayer();
        unSelectEdge({ userId: currentUserId });
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Update all selected layers
        const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));

        const offset = {
          x: point.x - canvasState.current.x,
          y: point.y - canvasState.current.y,
        };

        // Update all edges
        edges.map((edge) => {
          const isSource = activeLayerIDs?.includes(edge.fromLayerId);
          const isTarget = activeLayerIDs?.includes(edge.toLayerId);

          if (!isSource && !isTarget) {
            return edge;
          }

          const updatedStart = isSource
            ? { ...edge.start, x: edge.start.x + offset.x, y: edge.start.y + offset.y }
            : edge.start;

          const updatedEnd = isTarget ? { ...edge.end, x: edge.end.x + offset.x, y: edge.end.y + offset.y } : edge.end;

          updateEdge({
            id: edge.id,
            userId: currentUserId,
            updatedElementEdge: { start: updatedStart, end: updatedEnd },
          });
        });

        for (const layer of selectedLayers) {
          // Check if the position has changed
          if (layer.x !== canvasState.initialLayerBounds?.x || layer.y !== canvasState.initialLayerBounds?.y) {
            updateLayer({
              id: layer.id,
              userId: currentUserId,
              updatedElementLayer: { x: layer.x, y: layer.y },
            });
          }
        }

        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Resizing) {
        // Update all selected layers
        const selectedLayers = layers.filter((layer) => activeLayerIDs?.includes(layer.id));

        for (const layer of selectedLayers) {
          updateLayer({
            id: layer.id,
            userId: currentUserId,
            updatedElementLayer: { x: layer.x, y: layer.y, width: layer.width, height: layer.height },
          });
        }

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
      } else if (canvasState.mode === CanvasMode.EdgeActive) {
        setCanvasState({
          mode: CanvasMode.EdgeActive,
        });
        setDrawingEdge({
          ongoing: false,
          lastEdgeId: undefined,
          fromLayerId: undefined,
          fromHandlePosition: undefined,
        });
      } else if (canvasState.mode === CanvasMode.EdgeDrawing) {
        if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
          const lastUpdatedEdge = edges.find((edge) => edge.id === drawingEdge.lastEdgeId);

          if (!lastUpdatedEdge) return;

          // ON EDGE DROP CREATE A LAYER
          if (lastUpdatedEdge.fromLayerId && !lastUpdatedEdge.toLayerId) {
            const currentLayer = layers.find((layer) => layer.id === lastUpdatedEdge.fromLayerId);
            const LAYER_SPACING = 150; // Adjust this value to control the space between layers
            const HANDLE_DISTANCE = 20;
            const position = lastUpdatedEdge.handleStart || HandlePosition.Left;
            const endPoint = drawingEdge.endPoint;

            if (!currentLayer) {
              console.error("Layer not found");
              return;
            }

            // Calculate the new position based on the clicked handle's position
            const { newLayerPosition, newEdgePosition } = calculateNewLayerPositions(
              currentLayer,
              position,
              LAYER_SPACING,
              HANDLE_DISTANCE,
              endPoint,
            );

            const newLayerId = nanoid();

            const newLayer: any = {
              id: newLayerId.toString(),
              type: currentLayer.type,
              x: newLayerPosition.x,
              y: newLayerPosition.y,
              width: currentLayer.width,
              height: currentLayer.height,
              fill: currentLayer.fill,
              value: whiteboardText("addLayerPlaceHolder"),
            };

            addLayer({ layer: newLayer, userId: currentUserId });

            selectLayer({ userId: currentUserId, layerIds: [newLayer.id] });

            if (drawingEdge.ongoing && drawingEdge.lastEdgeId && drawingEdge.fromLayerId) {
              updateEdge({
                id: drawingEdge.lastEdgeId,
                userId: currentUserId,
                updatedElementEdge: {
                  toLayerId: newLayer.id,
                  end: newEdgePosition,
                  handleStart: position,
                  orientation: getOrientationFromPosition(position),
                },
              });
            }
          } else {
            const { id, ...updatedProperties } = lastUpdatedEdge;
            
            updateEdge({
              id,
              userId: currentUserId,
              updatedElementEdge: updatedProperties,
            });
          }
        }

        setDrawingEdge({
          ongoing: false,
          lastEdgeId: undefined,
          fromLayerId: undefined,
          fromHandlePosition: undefined,
        });
        unSelectEdge({ userId: currentUserId });
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.EdgeEditing) {
        if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
          const lastUpdatedEdge = edges.find((edge) => edge.id === drawingEdge.lastEdgeId);

          if (!lastUpdatedEdge) return;

          const { id, ...updatedProperties } = lastUpdatedEdge;

          updateEdge({
            id,
            userId: currentUserId,
            updatedElementEdge: updatedProperties,
          });
        }

        setDrawingEdge({
          ongoing: false,
          lastEdgeId: undefined,
          fromLayerId: undefined,
          fromHandlePosition: undefined,
        });
        unSelectEdge({ userId: currentUserId });
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    },
    [camera, canvasState, handleUnSelectLayer, unSelectEdge, currentUserId, setCanvasState, layers, edges, activeLayerIDs, updateEdge, updateLayer, drawingEdge, whiteboardText, addLayer, selectLayer, insertLayer],
  );

  const handlePointerLeave = useCallback(() => {
    // but cursor to null when leaving canvas
    if (userMindmapDetails.members.length > 1)
      socketEmit("cursor-move", {
        roomId: boardId,
        userId: currentUserId,
        cursor: null,
      });
    // setMyPresence({ cursor: null });
  }, [boardId, currentUserId, socketEmit, userMindmapDetails]);

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

    // const svgRect = svgElement.getBoundingClientRect();
    // const gRect = gElement.getBoundingClientRect();

    // console.log('gRectWidth:', gRect.width);
    // console.log('gRectHeight:', gRect.height);

    // const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    // const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // const scaleX = (viewportWidth * 0.8) / gRect.width;
    // const scaleY = (viewportHeight * 0.8) / gRect.height;

    // const scale = Math.min(scaleX, scaleY, 1);

    // const translateX = (viewportWidth - gRect.width * scale) / 2 - gRect.x * scale;
    // const translateY = (viewportHeight - gRect.height * scale) / 2 - gRect.y * scale;

    // setCamera({ x: translateX, y: translateY, scale: scale });

    // setTimeout(() => {
    //   setApplyTransition(false);
    // }, CANVAS_TRANSITION_TIME);

    // setShowResetButton(false);
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
        if (canvasState.mode === CanvasMode.Typing) return;
        event.preventDefault();
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
        const layerIdsToDelete = selectedLayers.map((layer) => layer.id);

        removeLayer({ layerIdsToDelete, userId: currentUserId });
        handleUnSelectLayer();

        for (const layer of selectedLayers) {
          if (layer) {
            removeEdgesConnectedToLayer(layer.id);
          }
        }
      }

      if (event.code === "Backspace" && activeEdgeId?.length >= 0 && activeEdgeId[0] && canvasState.mode === CanvasMode.EdgeActive) {
        removeEdge({
          id: activeEdgeId[0],
          userId: currentUserId,
        });
        unSelectEdge({ userId: currentUserId });
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        if (canvasState.mode === CanvasMode.Typing) return;
        event.preventDefault();
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
  }, [activeLayerIDs, canvasState, layers, removeLayer, handleUnSelectLayer, setCanvasState, removeEdgesConnectedToLayer, removeEdge, currentUserId, unSelectEdge, activeEdgeId]);

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
    <main className="h-full w-full relative touch-none select-none">
      {DEBUG_MODE && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-white dark:bg-black border border-gray-300 p-2 rounded shadow-md dark:text-primary-color">
          <h3 className="font-bold mb-1">Canvas State:</h3>
          <p className="text-sm mb-1">
            <strong>Mode:</strong> {CanvasMode[canvasState.mode]}
            {/* {JSON.stringify(canvasState, null, 2)} */}
          </p>
          <p className="text-sm mb-1">
            <strong>ShadowState:</strong> {JSON.stringify(shadowState.showShadow, null, 2)}
          </p>
          <pre className="text-xs whitespace-pre-wrap">
            <strong>Drawing Edge State: </strong>
            {JSON.stringify(drawingEdge, null, 2)}
          </pre>
          <div className="text-sm mb-1">
            <strong>Active Edges:</strong>

            {allActiveEdges.map((activeEdge: any, index: any) => (
              <section key={index}>
                <p>{activeEdge.userId === currentUserId ? "current user" : activeEdge.userId}</p>
                <pre>{JSON.stringify(activeEdge.edgeIds, null, 2)}</pre>
              </section>
            ))}
            {/*             
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(allActiveLayers[0].layerIds, null, 2)}</pre> */}
          </div>
          <p className="text-sm mb-1">
            <strong>Hovered Edge ID:</strong> {hoveredEdgeId || "None"}
          </p>
          <div className="text-sm mb-1">
            <strong>Active Layers:</strong>

            {allActiveLayers.map((activeLayer: any, index: any) => (
              <section key={index}>
                <p>{activeLayer.userId === currentUserId ? "current user" : activeLayer.userId}</p>
                <pre>{JSON.stringify(activeLayer.layerIds, null, 2)}</pre>
              </section>
            ))}
            {/*             
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(allActiveLayers[0].layerIds, null, 2)}</pre> */}
          </div>
        </div>
      )}
      <figure id='canvas' className="h-[100vh] w-[100vw]">
        <svg
          ref={svgRef}
          className="h-full w-full absolute inset-0"
          style={{
            backgroundPosition: `${camera.x}px ${camera.y}px`,
            backgroundImage: `radial-gradient(${theme === "dark" ? "#111212FF" : "#e5e7eb"} ${1 * camera.scale}px, transparent 1px)`,
            backgroundSize: `${16 * camera.scale}px ${16 * camera.scale}px`,
          }}
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
              cursor: "pointer",
            }}
          >
            {edges.map((edge, index) => 
              <EdgePreview
                key={index}
                edge={edge}
                onEdgePointerDown={(e, edgeId) => handleEdgeClick(e, edgeId)}
                ARROW_SIZE={ARROW_SIZE}
                selectionColor={edgeIdsToColorSelection[edge.id]} 
              />
            )}
            {/* {layers.map((layer, index) => ( */}
            {sortLayersBySelection(layers).map((layer, index) => (
              <LayerPreview
                key={index}
                layer={layer}
                onLayerPointerDown={(e, layerId, origin) => handleLayerPointerDown(e, layerId, origin!)}
                selectionColor={layerIdsToColorSelection[layer.id]}
              />
            ))}
            {shadowState.showShadow && shadowState.edgePosition && (
              <ShadowEdge
                start={shadowState.startPosition}
                end={shadowState.edgePosition}
                fromPosition={shadowState.fromHandlePosition}
              />
            )}
            {shadowState.showShadow && shadowState.layerPosition && (
              <ShadowLayer
                type={shadowState.layer!.type}
                position={shadowState.layerPosition}
                width={shadowState.layer!.width}
                height={shadowState.layer!.height}
                fill={shadowState.layer!.fill}
              />
            )}
            {/* {activeEdgeId && (
            <EdgeSelectionBox
              edge={edges.find((edge) => edge.id === activeEdgeId[0])!}
              onHandlePointerDown={handleEdgeHandlePointerDown}
            />
          )} */}
            <EdgeSelectionBox
              edge={edges.find((edge) => activeEdgeId?.includes(edge.id))!}
              onHandlePointerDown={handleEdgeHandlePointerDown}
            />
            <SelectionBox onResizeHandlePointerDown={handleResizeHandlePointerDown} />
            <LayerHandles
              onMouseEnter={onHandleMouseEnter}
              onMouseLeave={onHandleMouseLeave}
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
      </figure>
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
      <EdgeSelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
    </main>
  );
};

export { Whiteboard };

