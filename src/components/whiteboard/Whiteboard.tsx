import { Lock } from "@ably/spaces";
import { useSpace } from "@ably/spaces/react";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform } from "d3-zoom";
import html2canvas from "html2canvas";
import { nanoid } from "nanoid";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { updateBoardLayersById } from "@/_services/mindgen/mindgenService";
import {
  CanvasMode,
  Color,
  Edge,
  EdgeShape,
  EdgeType,
  HandlePosition,
  Layer,
  LayerType,
  MindMapDetailsProps,
  Point,
  Side,
  XYWH,
} from "@/_types";
import { ablyClient } from "@/app/providers";
import { useLiveValue, useSelectionBounds } from "@/hooks";
import {
  activeEdgeIdAtom,
  activeLayersAtom,
  cameraStateAtom,
  canvasStateAtom,
  edgesAtomState,
  hoveredEdgeIdAtom,
  isEdgeNearLayerAtom,
  layerAtomState,
  nearestLayerAtom,
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
  calculateNonOverlappingLayerPosition,
  checkPermission,
  findIntersectingLayersWithRectangle,
  findNearestLayerHandle,
  getHandlePosition,
  getLayerById,
  getOppositeHandlePosition,
  getOrientationFromPosition,
  pointerEventToCanvasPoint,
  randomUserColor,
  resizeBounds,
} from "@/utils";

import { Button } from "../ui";
import { CursorPresence } from "./collaborate";
import { EdgePreview, EdgeSelectionBox, EdgeSelectionTools, ShadowEdge } from "./edges";
import { LayerHandles, SelectionBox, SelectionTools, ShadowLayer } from "./layers";
import { LayerPreview } from "./layers/LayerPreview";
import { Toolbar } from "./Toolbar";

const Whiteboard = ({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const DEBUG_MODE: string | undefined = process.env.NEXT_PUBLIC_DEBUG_MODE;

  const { theme } = useTheme();
  const boardId = userMindmapDetails.id;

  const whiteboardText = useTranslations("Whiteboard");
  const zoomBehaviorRef = useRef<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [, setShowResetButton] = useState(false);

  const [camera, setCamera] = useRecoilState(cameraStateAtom);
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  const [isCapturing, setIsCapturing] = useState(false);

  const [, setLastUsedColor] = useState<Color>({
    r: 50,
    g: 20,
    b: 188,
  });

  const MAX_LAYERS = 100;
  const PERMISSIONS = userMindmapDetails.connectedMemberPermissions;

  // ================  SOCKETS  ================== //

  const { space } = useSpace();

  useLiveValue({ boardId });
  const session: any = useSession();
  const currentUserName = session.data?.session?.user?.username;
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

  // ================  FITVIEW  ================== //

  const fitView = useCallback(() => {
    if (canvasState.mode === CanvasMode.Translating || !svgRef.current || !gRef.current || !zoomBehaviorRef.current)
      return;

    const svg = select(svgRef.current);

    // Get the bounding box of the content
    const bounds = gRef.current.getBBox();
    const svgWidth = svgRef.current.clientWidth;
    const svgHeight = svgRef.current.clientHeight;

    // Calculate scale to fit content with padding
    const padding = 40;
    const scale = Math.min(svgWidth / (bounds.width + padding * 2), svgHeight / (bounds.height + padding * 2)) * 0.75; // 90% of max scale for padding

    // Calculate translation to center content
    const centerX = svgWidth / 2 - (bounds.x + bounds.width / 2) * scale;
    const centerY = svgHeight / 2 - (bounds.y + bounds.height / 2) * scale;

    const transform = zoomIdentity.translate(centerX, centerY).scale(scale);

    svg.transition().duration(500).call(zoomBehaviorRef.current.transform, transform);
  }, [canvasState]);

  // ================  INITIAL RENDER  ================== //
  useEffect(() => {
    if (layers?.length > 0 && svgRef.current && gRef.current && zoomBehaviorRef.current) {
      fitView();
    }

    if (!checkPermission(PERMISSIONS, "UPDATE")) {
      setCanvasState({
        mode: CanvasMode.Grab,
      });

      return;
    }

    setCanvasState({
      mode: CanvasMode.None,
    });
  }, []); // Run when layers or refs change

  // ================  ENTERING SPACE & CHANNEL ================== //

  useEffect(() => {
    space?.enter({ username: currentUserName, userId: currentUserId, userColor: randomUserColor() });
  }, [currentUserId, currentUserName, space]);

  // ================  UPDATE FOR LAYER & EDGE CHANGES ================== //

  useEffect(() => {
    if (canvasState.mode == CanvasMode.Importing) {
      fitView();
      return;
    }
  }, [layers, edges, fitView, canvasState.mode]);

  // ================  CONSTANT LAYERS  ================== //

  const [allActiveLayers, setAllActiveLayers] = useRecoilState(activeLayersAtom);
  const bounds = useSelectionBounds();

  const selectLayer = useSelectElement({ roomId: boardId });
  const unSelectLayer = useUnSelectElement({ roomId: boardId });
  const addLayer = useAddElement({ roomId: boardId });
  const updateLayer = useUpdateElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });

  // ================  CONSTANT EDGES  ================== //

  const allActiveEdges: any = useRecoilValue(activeEdgeIdAtom);
  const activeEdgeId = allActiveEdges[0];

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

  // ================  USE QUERY & SAVE MINDMAPS  ================== //

  const queryClient = useQueryClient();

  const updateBoardMutation = useMutation(updateBoardLayersById, {
    onSuccess: () => {
      // Optionally, invalidate or refetch other queries to update the UI
      queryClient.invalidateQueries("mindmaps");
    },
  });

  // ================  INTERCEPT AND SAVE  ================== //

  const takeScreenshot = useCallback(async () => {
    setIsCapturing(true);
    const canvasElement = document.getElementById("canvas");

    if (canvasElement) {
      canvasElement.style.color = "white";
      canvasElement.style.fontFamily = "sans-serif";
      canvasElement.style.backgroundColor = theme === "dark" ? "#050713" : "#fdfdff";

      const canvas = await html2canvas(canvasElement);
      const base64Image = canvas.toDataURL("image/png");

      canvasElement.style.backgroundColor = "transparent";

      // setPictureUrl(base64Image);
      setIsCapturing(false);
      return base64Image;
    }
  }, [theme]);

  const saveMindmap = useCallback(async () => {
    if (!checkPermission(PERMISSIONS, "UPDATE")) return;

    const newMindmapObject = {
      layers,
      edges,
      pictureUrl: await takeScreenshot(),
    };

    unSelectLayer();

    updateBoardMutation.mutate({
      session: session,
      mindmapId: userMindmapDetails.id,
      mindmapObject: newMindmapObject,
    });
  }, [PERMISSIONS, edges, layers, session, takeScreenshot, unSelectLayer, updateBoardMutation, userMindmapDetails.id]);

  // Handle window/tab close and navigation away
  useEffect(() => {
    let isCapturing = false;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden" && !isCapturing) {
        isCapturing = true;
        await saveMindmap();
        isCapturing = false;
      }
    };

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (canvasState.mode == CanvasMode.Exporting) return;

      // Modern browsers require the event to be canceled and a message to be shown
      e.preventDefault();

      if (!isCapturing) {
        isCapturing = true;
        await saveMindmap();
        isCapturing = false;
      }

      // Show a standard confirmation dialog
      // Note: Most modern browsers show their own generic message regardless of what we set here
      return (e.returnValue = "");
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
    };
  }, [canvasState.mode, saveMindmap]);

  // Handle navigation state changes
  useEffect(() => {
    // if (canvasState.mode == CanvasMode.Exporting) return;
    // Create a proxy for router.push
    const originalPush = router.push;

    router.push = async (...args: Parameters<typeof router.push>) => {
      await saveMindmap();
      return originalPush.apply(router, args);
    };

    return () => {
      // Restore original push method
      router.push = originalPush;
    };
  }, [canvasState.mode, pathname, router, saveMindmap, searchParams]);

  // Intercept Link component clicks
  const handleLinkClick = useCallback(
    async (e: MouseEvent) => {
      if (canvasState.mode == CanvasMode.Exporting) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link?.getAttribute("href") && !link.getAttribute("href")?.startsWith("#")) {
        e.preventDefault();
        await saveMindmap();

        // Use router.push for internal navigation
        const href = link.getAttribute("href") || "";

        if (href.startsWith("/") || href.startsWith(window.location.origin)) {
          router.push(href);
        } else {
          // For external links, use regular navigation
          window.location.href = href;
        }
      }
    },
    [canvasState.mode, saveMindmap, router],
  );

  useEffect(() => {
    // Add click handler to document
    document.addEventListener("click", handleLinkClick as any);

    return () => {
      document.removeEventListener("click", handleLinkClick as any);
    };
  }, [handleLinkClick]);

  // ================  LAYERS  ================== //

  const insertLayer = useCallback(
    (layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Diamond | LayerType.Path, position: Point) => {
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

      fitView();

      selectLayer({ layerIds: [newLayer.id] });

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
    },
    [addLayer, fitView, currentUserId, layers.length, selectLayer, setCanvasState, whiteboardText],
  );

  const handleLayerPointerDown = useCallback(
    async (e: React.PointerEvent, layerId: string, origin: Point) => {
      e.stopPropagation();
      if (
        canvasState.mode === CanvasMode.Grab ||
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting ||
        canvasState.mode === CanvasMode.Tooling
      ) {
        return;
      }

      // Check if locked by other user
      const othersLocks: Lock[] | undefined = await space?.locks.getOthers();

      if (othersLocks && othersLocks?.length > 0) {
        othersLocks.forEach((lock) => {
          const { layerIds } = lock.attributes as {
            layerIds: string[];
          };

          if (layerIds?.includes(layerId)) {
            const profileData = lock.member.profileData as {
              username: string;
              userId: string;
              userColor: string;
            };

            alert(`locked by: ${profileData.username}`);

            return;
          }
        });
      }

      // On click if typing mode on selected layer change to type mode
      if (canvasState.mode === CanvasMode.LayerSelected && allActiveLayers.includes(layerId)) {
        setCanvasState({
          mode: CanvasMode.Typing,
        });
        return;
      }

      // On click if typing mode on selected layer do nothing
      if (canvasState.mode === CanvasMode.Typing && allActiveLayers.includes(layerId)) {
        setCanvasState({
          mode: CanvasMode.Typing,
        });
        return;
      }

      const point = pointerEventToCanvasPoint(e, camera, svgRef.current);

      // If multiple layers selected enter translate mode
      if (allActiveLayers.length > 0) {
        setCanvasState({
          mode: CanvasMode.Translating,
          current: point,
          initialLayerBounds: getLayerById({ layerId, layers }),
        });
        return;
      }

      const isAlreadySelected = allActiveLayers.includes(layerId);

      if (isAlreadySelected) return;

      // If Shift is held, add the layerId to the activeLayerIds array without removing other
      if (e.shiftKey) {
        setAllActiveLayers((prev) => {
          if (prev.includes(layerId)) return prev;
          return [...prev, layerId];
        });

        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin,
        });

        selectLayer({ layerIds: allActiveLayers });
        return;
      }

      selectLayer({ layerIds: [layerId] });
      unSelectEdge();

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
        initialLayerBounds: getLayerById({ layerId, layers }),
      });

      return;
    },
    [
      canvasState.mode,
      space,
      allActiveLayers,
      camera,
      selectLayer,
      unSelectEdge,
      setCanvasState,
      layers,
      setAllActiveLayers,
    ],
  );

  const onHandleMouseEnter = useCallback(
    (event: React.MouseEvent, layerId: string, position: HandlePosition) => {
      if (
        canvasState.mode === CanvasMode.EdgeDrawing ||
        canvasState.mode === CanvasMode.SelectionNet ||
        canvasState.mode === CanvasMode.Typing
      )
        return;

      const currentLayer = layers.find((layer) => layer.id === layerId);
      const LAYER_SPACING = 150; // Adjust this value to control the space between layers
      const HANDLE_DISTANCE = 20;

      if (!currentLayer) {
        console.error("Layer not found");
        return;
      }

      const startPoint = getHandlePosition(currentLayer, position);

      const { newLayerPosition, newEdgePosition } = calculateNonOverlappingLayerPosition({
        currentLayer,
        position,
        layers,
        LAYER_SPACING,
        HANDLE_DISTANCE,
      });

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
      canvasState.mode === CanvasMode.Typing ||
      drawingEdge.ongoing
    )
      return;

    // If layer already selected go back to LayerSelected method
    if (allActiveLayers.length > 0) {
      setCanvasState({
        mode: CanvasMode.LayerSelected,
      });
      return;
    }

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
  }, [allActiveLayers.length, canvasState.mode, drawingEdge.ongoing, setCanvasState]);

  const onHandleMouseDown = useCallback(
    (e: React.PointerEvent, layerId: string, position: HandlePosition) => {
      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        // updateEdge(drawingEdge.lastEdgeId, { fromLayerId: layerId });

        updateEdge({
          id: drawingEdge.lastEdgeId,
          updatedElementEdge: { fromLayerId: layerId },
        });

        setDrawingEdge((prev) => ({ ...prev, fromLayerId: layerId, fromHandlePosition: position }));
      }
    },
    [drawingEdge, updateEdge],
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
      const { newLayerPosition, newEdgePosition } = calculateNonOverlappingLayerPosition({
        currentLayer,
        position,
        layers,
        LAYER_SPACING,
        HANDLE_DISTANCE,
      });

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

      addLayer({ layer: newLayer });
      selectLayer({ layerIds: [newLayer.id] });

      if (drawingEdge.ongoing && drawingEdge.lastEdgeId) {
        updateEdge({
          id: drawingEdge.lastEdgeId,
          updatedElementEdge: {
            toLayerId: newLayer.id,
            end: newEdgePosition,
            handleEnd: getOppositeHandlePosition(position),
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
    [addLayer, canvasState, drawingEdge, layers, selectLayer, setCanvasState, updateEdge, whiteboardText],
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
          if (allActiveLayers.includes(layer.id)) {
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
        const isSource = allActiveLayers?.includes(edge.fromLayerId);
        const isTarget = allActiveLayers?.includes(edge.toLayerId);

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
    [canvasState, setLayers, edges, setEdges, setCanvasState, layers, allActiveLayers],
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
          if (!allActiveLayers?.includes(layer.id)) {
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
        const isSource = allActiveLayers?.includes(edge.fromLayerId);
        const isTarget = allActiveLayers?.includes(edge.toLayerId);

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
    [canvasState, setLayers, edges, setEdges, allActiveLayers],
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

      setAllActiveLayers(ids);
    },
    [layers, setAllActiveLayers, setCanvasState],
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
    unSelectLayer();
  }, [unSelectLayer]);

  const sortLayersBySelection = useCallback(
    (layersToSort: Layer[]) => {
      if (!Array.isArray(layersToSort)) {
        console.error("layersToSort is not an array:", layersToSort);
        return [layersToSort];
      }

      return [...layersToSort].sort((a, b) => {
        if (!a || !b) {
          console.error("Invalid layer object:", { a, b });
          return 0;
        }

        const aSelected = allActiveLayers?.includes(a.id) ? 1 : 0;
        const bSelected = allActiveLayers?.includes(b.id) ? 1 : 0;

        return aSelected - bSelected; // Changed to sort selected layers first
      });
    },
    [allActiveLayers],
  );

  // ================  EDGES  ================== //

  const removeEdgesConnectedToLayer = useCallback(
    (layerId: string) => {
      if (!checkPermission(PERMISSIONS, "DELETE")) {
        alert("You don't have the rights to delete");
        return;
      }

      edges.forEach((edge) => {
        if (edge.fromLayerId === layerId || edge.toLayerId === layerId) {
          removeEdge({
            edgeIdsToDelete: [edge.id],
          });
        }
      });
    },
    [PERMISSIONS, edges, removeEdge],
  );

  const handleEdgeHandlePointerDown = useCallback(
    (position: "START" | "MIDDLE" | "END", point: Point) => {
      if (activeEdgeId)
        setCanvasState({
          mode: CanvasMode.EdgeEditing,
          editingEdge: {
            id: activeEdgeId,
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

      const { id, handlePosition } = canvasState.editingEdge;
      const edge = edges.find((e) => e.id === id);

      // Check if edge is undefined
      if (!edge) {
        return; // Exit the function if edge is not found
      }

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

      let updatedEdge: Edge;

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
      }

      setEdges((prevEdges) => prevEdges.map((e) => (e.id === id ? updatedEdge : e)));
      setCanvasState({
        ...canvasState,
        editingEdge: { ...canvasState.editingEdge, startPoint: point },
      });
    },
    [canvasState, edges, layers, setIsEdgeNearLayer, setNearestLayer, setEdges, setCanvasState, drawingEdge],
  );

  const handleEdgeClick = useCallback(
    async (e: React.PointerEvent, edgeId: string) => {
      e.stopPropagation();
      if (canvasState.mode === CanvasMode.Grab) return;

      // Check if locked by other user
      const othersLocks: Lock[] | undefined = await space?.locks.getOthers();

      if (othersLocks && othersLocks?.length > 0) {
        othersLocks.forEach((lock) => {
          const { edgeIds } = lock.attributes as {
            edgeIds: string[];
          };

          if (edgeIds?.includes(edgeId)) {
            const profileData = lock.member.profileData as {
              username: string;
              userId: string;
              userColor: string;
            };

            alert(`locked by: ${profileData.username}`);

            return;
          }
        });
      }

      const isAlreadySelected = allActiveEdges.includes(edgeId);

      if (isAlreadySelected) return;

      selectEdge({ edgeIds: [edgeId] });
      unSelectLayer();
      setHoveredEdgeId(null);
      // handleUnSelectLayer();

      setCanvasState({
        mode: CanvasMode.EdgeSelected,
      });

      return;
    },
    [allActiveEdges, canvasState.mode, selectEdge, setCanvasState, setHoveredEdgeId, space?.locks, unSelectLayer],
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

        selectEdge({ edgeIds: [lastUpdatedEdge.id] });

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
    [
      canvasState.mode,
      drawingEdge,
      handleUnSelectLayer,
      edges,
      selectEdge,
      layers,
      setIsEdgeNearLayer,
      setNearestLayer,
      setEdges,
      setCanvasState,
    ],
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
        const selectedLayer = layers.find((layer) => allActiveLayers?.includes(layer.id));

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
            handleEnd: getOppositeHandlePosition(handlePosition),
            handleStart: handlePosition,
            end: point,
            orientation: "auto",
            hoverColor: {
              r: 77,
              g: 106,
              b: 255,
            },
            type: EdgeType.Solid,
            shape: EdgeShape.Curved,
          };

          // Update edges state with the new edge
          addEdge({ edge: newEdge });

          // Set drawingEdge state to indicate an edge drawing operation is ongoing
          setDrawingEdge({ ongoing: true, lastEdgeId: newEdge.id, fromLayerId: selectedLayer.id });

          unSelectEdge();
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
            shape: EdgeShape.Curved,
          };

          // Update edges state with the new edge
          addEdge({ edge: newEdge });

          // Set drawingEdge state to indicate an edge drawing operation is ongoing
          setDrawingEdge({ ongoing: true, lastEdgeId: newEdge.id, fromLayerId: undefined });
        }

        return;
      } else if (canvasState.mode === CanvasMode.EdgeActive) {
        // unSelectEdge();
        setHoveredEdgeId(null);

        return;
      } else if (canvasState.mode === CanvasMode.EdgeSelected) {
        setCanvasState({
          mode: CanvasMode.None,
        });
        return;
      } else if (canvasState.mode === CanvasMode.Typing) {
        return;
      } else if (canvasState.mode === CanvasMode.Tooling) {
        // If we're already in Tooling mode, do nothing
        return;
      } else {
        setCanvasState({
          origin: point,
          mode: CanvasMode.Pressing,
        });
      }
    },
    [
      camera,
      canvasState.mode,
      layers,
      allActiveLayers,
      shadowState.startPosition,
      addEdge,
      unSelectEdge,
      setHoveredEdgeId,
      setCanvasState,
    ],
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
      } else if (canvasState.mode === CanvasMode.Inserting) {
        const newLayer: Layer = {
          id: "shadow" + layers.length,
          type: canvasState.layerType,
          x: 0,
          y: 0,
          width: canvasState.layerType === LayerType.Rectangle ? 200 : 150,
          height: canvasState.layerType === LayerType.Rectangle ? 60 : 150,
          fill: { r: 77, g: 106, b: 255 },
          value: whiteboardText("typeSomething"),
        };

        setShadowState({
          showShadow: true,
          startPosition: null,
          fromHandlePosition: undefined,
          layerPosition: current,
          edgePosition: null,
          layer: newLayer,
        });
      } else if (canvasState.mode === CanvasMode.Edge || canvasState.mode == CanvasMode.EdgeDrawing) {
        drawEdgeline(current);
      } else if (canvasState.mode === CanvasMode.EdgeEditing) {
        updateEdgePosition(current);
      }

      if (userMindmapDetails.members.length > 1 && space) {
        space.cursors.set({
          position: { ...current },
          data: { state: "move" },
        });
      }
    },
    [
      camera,
      canvasState,
      userMindmapDetails.members.length,
      startMultiSelection,
      updateSelectionNet,
      translateSelectedLayer,
      resizeSelectedLayer,
      layers.length,
      whiteboardText,
      drawEdgeline,
      updateEdgePosition,
      space,
    ],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera, svgRef.current);

      if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
        handleUnSelectLayer();
        unSelectEdge();
        setCanvasState({
          mode: CanvasMode.None,
          current: point,
        });
      } else if (canvasState.mode === CanvasMode.Translating) {
        // Update all selected layers
        const selectedLayers = layers.filter((layer) => allActiveLayers?.includes(layer.id));

        const offset = {
          x: point.x - canvasState.current.x,
          y: point.y - canvasState.current.y,
        };

        // Update all edges
        edges.map((edge) => {
          const isSource = allActiveLayers?.includes(edge.fromLayerId);
          const isTarget = allActiveLayers?.includes(edge.toLayerId);

          if (!isSource && !isTarget) {
            return edge;
          }

          const updatedStart = isSource
            ? { ...edge.start, x: edge.start.x + offset.x, y: edge.start.y + offset.y }
            : edge.start;

          const updatedEnd = isTarget ? { ...edge.end, x: edge.end.x + offset.x, y: edge.end.y + offset.y } : edge.end;

          updateEdge({
            id: edge.id,
            updatedElementEdge: { start: updatedStart, end: updatedEnd },
          });
        });

        for (const layer of selectedLayers) {
          // Check if the position has changed
          if (layer.x !== canvasState.initialLayerBounds?.x || layer.y !== canvasState.initialLayerBounds?.y) {
            updateLayer({
              id: layer.id,
              updatedElementLayer: { x: layer.x, y: layer.y },
            });
          }
        }

        setCanvasState({
          mode: CanvasMode.LayerSelected,
        });
      } else if (canvasState.mode === CanvasMode.Resizing) {
        // Update all selected layers
        const selectedLayers = layers.filter((layer) => allActiveLayers?.includes(layer.id));

        for (const layer of selectedLayers) {
          updateLayer({
            id: layer.id,
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
        // setCanvasState({
        //   mode: CanvasMode.EdgeActive,
        // });
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

            addLayer({ layer: newLayer });

            selectLayer({ layerIds: [newLayer.id] });

            if (drawingEdge.ongoing && drawingEdge.lastEdgeId && drawingEdge.fromLayerId) {
              updateEdge({
                id: drawingEdge.lastEdgeId,
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
        unSelectEdge();
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
            updatedElementEdge: updatedProperties,
          });
        }

        setDrawingEdge({
          ongoing: false,
          lastEdgeId: undefined,
          fromLayerId: undefined,
          fromHandlePosition: undefined,
        });
        unSelectEdge();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.EdgeSelected) {
        setCanvasState({
          mode: CanvasMode.EdgeSelected,
        });

        return;
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        selectLayer({ layerIds: allActiveLayers });
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Typing) {
        if (!bounds) return;

        const isInsideBounds =
          point.x >= bounds.x &&
          point.x <= bounds.x + bounds.width &&
          point.y >= bounds.y &&
          point.y <= bounds.y + bounds.height;

        if (!isInsideBounds) {
          // if click is outside bound change type
          unSelectLayer();
          setCanvasState({
            mode: CanvasMode.None,
            current: point,
          });
          return;
        }

        return;
      } else {
        setCanvasState({
          mode: CanvasMode.None,
          current: point,
        });
      }
    },
    [
      camera,
      canvasState,
      unSelectLayer,
      handleUnSelectLayer,
      unSelectEdge,
      setCanvasState,
      layers,
      edges,
      allActiveLayers,
      updateEdge,
      updateLayer,
      drawingEdge,
      whiteboardText,
      addLayer,
      selectLayer,
      insertLayer,
      bounds,
    ],
  );

  // ================  LEAVING SPACE WHILE LEAVING BOARD  ================== //

  const handleSelfCursorLeave = async () => {
    const layerChannelName = `[?rewind=1]${boardId}`;

    const channel = ablyClient.channels.get(layerChannelName);

    channel.unsubscribe();

    handleUnSelectLayer();

    await space?.cursors.set({
      position: { x: 0, y: 0 },
      data: { state: "leave" },
    });

    await space?.leave();
  };
  // ================  CAMERA FUNCTIONS  ================== //

  const handleMouseMove = useCallback(() => {
    if (!isMouseDown || canvasState.mode !== CanvasMode.Grab) return;

    // Check if the <g> element is out of bounds
    const svgElement = document.querySelector("svg g");

    if (svgElement) {
      const rect = svgElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Check if <g> element is outside the viewport
      const isOutOfBounds = rect.top > viewportHeight || rect.right < 0 || rect.bottom < 0 || rect.left > viewportWidth;

      setShowResetButton(isOutOfBounds);
    }
  }, [isMouseDown, canvasState.mode]);

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

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);
    let zoomFactor = { min: 0.1, max: 4 };

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([zoomFactor.min, zoomFactor.max])
      .filter((event: any) => {
        const isTrackpad = event.wheelDeltaY
          ? Math.abs(event.wheelDeltaY) === Math.abs(event.deltaY * 3)
          : Math.abs(event.deltaY) < 50;

        // For wheel events, prevent default behavior when Ctrl is pressed
        if (event.type === "wheel") {
          if (event.ctrlKey) {
            event.preventDefault(); // Prevent the default browser zoom
            return true; // Still allow our zoom to work
          }
          if (isTrackpad) {
            // Only allow translation (pan), not zoom, for trackpad
            event.preventDefault();
            // Get current transform
            const currentTransform = zoomTransform(svg.node()!);
            // Create new transform with updated translation
            const transform = zoomIdentity
              .translate(currentTransform.x - event.deltaX, currentTransform.y - event.deltaY)
              .scale(currentTransform.k);
            // Apply the transform to the svg

            svg.call(zoomBehavior.transform, transform);
            return false; // Prevent the default zoom behavior
          }
        }

        return canvasState.mode === CanvasMode.Grab && (event.type === "mousedown" || event.type === "mousemove");
      })
      .on("zoom", (event) => {
        const { x, y, k } = event.transform;

        setCamera({ x, y, scale: k });
        g.attr("transform", event.transform.toString());
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    return () => {
      svg.on(".zoom", null);
    };
  }, [canvasState, setCamera]);

  const zoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    const newScale = Math.min(camera.scale * 1.2, 4);
    const transform = zoomIdentity.translate(camera.x, camera.y).scale(newScale);

    svg.transition().duration(300).call(zoomBehaviorRef.current.transform, transform);
  };

  const zoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = select(svgRef.current);
    const newScale = Math.max(camera.scale / 1.2, 0.1);
    const transform = zoomIdentity.translate(camera.x, camera.y).scale(newScale);

    svg.transition().duration(300).call(zoomBehaviorRef.current.transform, transform);
  };

  // New useEffect hook for canvas mode changes
  useEffect(() => {
    const updateCursorStyle = () => {
      if (canvasState.mode === CanvasMode.Grab) {
        document.body.style.cursor = "grab";
      } else if (canvasState.mode === CanvasMode.Edge) {
        document.body.style.cursor = "cell";
      } else if (canvasState.mode === CanvasMode.Inserting) {
        document.body.style.cursor = "crosshair";
      } else {
        document.body.style.cursor = "default";
        setShadowState({
          showShadow: false,
          startPosition: null,
          fromHandlePosition: undefined,
          layerPosition: null,
          edgePosition: null,
          layer: null,
        });
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
        if (canvasState.mode === CanvasMode.Typing || !checkPermission(PERMISSIONS, "UPDATE")) return;
        event.preventDefault();
        setCanvasState({
          mode: CanvasMode.Grab,
        });
      }

      if (event.code === "Enter" && canvasState.mode === CanvasMode.Edge) {
        // Reset drawingEdge state when pointer is released
        setDrawingEdge({ ongoing: false });
      }

      // On ENTER when insert mode go back to default mode
      if (event.code === "Enter" && canvasState.mode === CanvasMode.Inserting) {
        // Reset drawingEdge state when pointer is released
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      // On backspace delete layer
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
          if (layer) {
            removeEdgesConnectedToLayer(layer.id);
          }
        }
      }

      // On backspace delete edge
      if (event.code === "Backspace" && allActiveEdges?.length > 0 && canvasState.mode === CanvasMode.EdgeSelected) {
        if (!checkPermission(PERMISSIONS, "DELETE")) {
          alert("You don't have the rights to delete");
          return;
        }

        removeEdge({
          edgeIdsToDelete: [activeEdgeId],
        });
        unSelectEdge();
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        if (canvasState.mode === CanvasMode.Typing || !checkPermission(PERMISSIONS, "UPDATE")) return;
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
  }, [
    allActiveLayers,
    canvasState,
    layers,
    removeLayer,
    handleUnSelectLayer,
    setCanvasState,
    removeEdgesConnectedToLayer,
    removeEdge,
    currentUserId,
    unSelectEdge,
    allActiveEdges,
    PERMISSIONS,
    activeEdgeId,
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
    <main className="h-full w-full relative" onMouseLeave={handleSelfCursorLeave}>
      {checkPermission(PERMISSIONS, "UPDATE") && <Toolbar />}
      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800 p-4 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto mb-2"></div>
            <p>We are saving your mindmap...</p>
          </div>
        </div>
      )}
      {DEBUG_MODE && (
        <div className="fixed bottom-24 left-4 w-72 z-[9999] bg-white dark:bg-black border border-gray-300 p-2 rounded shadow-md dark:text-primary-color">
          <h3 className="font-bold mb-1">Canvas State:</h3>
          <p className="text-sm mb-1">
            <strong>Mode:</strong> {CanvasMode[canvasState.mode]}
            {JSON.stringify(canvasState, null, 2)}
          </p>
          <article className="text-sm mb-1">
            <strong>Camera position:</strong>
            <p>x: {camera.x}</p>
            <p>y: {camera.y}</p>
          </article>
          <p className="text-sm mb-1">
            <strong>Camera scale:</strong> {camera.scale}
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
                <p>{activeEdge}</p>
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

            <pre>{JSON.stringify(allActiveLayers, null, 2)}</pre>

            {/* {allActiveLayers.map((activeLayer: any, index: any) => (
              <section key={index}>
                <p>{activeLayer.userId === currentUserId ? "current user" : activeLayer.userId}</p>
                <pre>{JSON.stringify(activeLayer.layerIds, null, 2)}</pre>
              </section>
            ))} */}
          </div>
        </div>
      )}
      <figure id="canvas" className="h-[100vh] w-[100vw]">
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
            {edges.map((edge, index) => (
              <EdgePreview
                key={index}
                edge={edge}
                onEdgePointerDown={(e, edgeId) => handleEdgeClick(e, edgeId)}
                ARROW_SIZE={ARROW_SIZE}
              />
            ))}
            {/* {layers.map((layer, index) => ( */}
            {sortLayersBySelection(layers).map((layer, index) => (
              <LayerPreview
                key={index}
                layer={layer}
                onLayerPointerDown={(e, layerId, origin) => handleLayerPointerDown(e, layerId, origin!)}
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
            <LayerHandles
              onMouseEnter={onHandleMouseEnter}
              onMouseLeave={onHandleMouseLeave}
              onPointerDown={onHandleMouseDown}
              onPointerUp={onHandleMouseUp}
            />
            <SelectionBox onResizeHandlePointerDown={handleResizeHandlePointerDown} />
            <SelectionTools
              camera={camera}
              isDeletable={!checkPermission(PERMISSIONS, "DELETE")}
              setLastUsedColor={setLastUsedColor}
            />
            <EdgeSelectionTools
              camera={camera}
              isDeletable={!checkPermission(PERMISSIONS, "DELETE")}
              setLastUsedColor={setLastUsedColor}
            />
            <EdgeSelectionBox onHandlePointerDown={handleEdgeHandlePointerDown} />
            <CursorPresence />
            {canvasState.mode === CanvasMode.SelectionNet && canvasState.current && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          </g>
        </svg>
      </figure>
      {layers?.length > 0 && (
        <div className="fixed bottom-6 left-6 z-10 group">
          <div className="relative flex items-center gap-3 p-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={zoomOut}
                className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
              >
                <span className="text-lg font-medium text-slate-700 dark:text-slate-200">−</span>
              </Button>

              <div className="relative min-w-[64px]">
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg scale-y-[0.85] origin-center transition-transform duration-200 group-hover:scale-y-100" />
                <div className="relative px-2 py-1.5 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                  {Math.round(camera.scale * 100)}%
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={zoomIn}
                className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
              >
                <span className="text-lg font-medium text-slate-700 dark:text-slate-200">+</span>
              </Button>
            </div>

            {/* Fit View Button */}
            <Button
              variant="ghost"
              onClick={fitView}
              className="h-9 px-4 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
            >
              Fit to Screen
            </Button>

            <div className="absolute -z-10 inset-0 bg-white/40 dark:bg-slate-900/40 rounded-2xl blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            <div className="absolute -z-20 -inset-0.5 bg-gradient-to-br from-primary-color/20 to-secondary-color/20 dark:from-primary-color/10 dark:to-secondary-color/10 rounded-[1rem] blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
          </div>
        </div>
      )}
    </main>
  );
};

export { Whiteboard };
