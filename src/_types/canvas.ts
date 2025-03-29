/* eslint-disable no-unused-vars */
export type Camera = {
  x: number;
  y: number;
  scale: number;
};

export type Alignment = {
  vertical: {
    position: number;
    isCenter?: boolean;
    isLeft?: boolean;
    isRight?: boolean;
    otherLayerCenterPosition?: { y: number };
  }[];
  horizontal: {
    position: number;
    isCenter?: boolean;
    isTop?: boolean;
    isBottom?: boolean;
    otherLayerCenterPosition?: { x: number };
  }[];
  isPointNearCenterAlignment: boolean;
} | null;

export type Color = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export enum HandlePosition {
  Top = "TOP",
  Left = "LEFT",
  Right = "RIGHT",
  Bottom = "BOTTOM",
}

export type EdgeOrientation = "auto" | "10" | "45" | "0" | "90" | "-180" | "180" | "270";

export enum EdgeType {
  Solid,
  Dashed,
}

export enum EdgeShape {
  SmoothStep = "SMOOTHSTEP",
  Curved = "CURVED",
  Line = "LINE",
}

export type Edge = {
  id: string;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  handleStart?: HandlePosition;
  handleEnd?: HandlePosition;
  fromLayerId?: string;
  toLayerId?: string;
  start: Point;
  end: Point;
  controlPoint1?: Point;
  controlPoint2?: Point;
  color: Color;
  hoverColor: Color;
  thickness: number;
  orientation: EdgeOrientation;
  type: EdgeType;
  label: string;
  shape: EdgeShape;
};

export enum LayerType {
  Diamond = "DIAMOND",
  Rectangle = "RECTANGLE",
  Ellipse = "ELLIPSE",
  Path = "PATH",
}

export type LayerBorderType = "SOLID" | "DASHED";

export type ValueStyle = {
  // fontSize: number;
  // fontFamily: string;
  // fontStyle: string;
  fontWeight: string;
  textTransform: string;
};

export type Layer = RectangleLayer | EllipseLayer | PathLayer | DiamondLayer;

export type LayerWithGeometry = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
  valueStyle?: ValueStyle;
  borderColor?: Color;
  borderWidth?: number;
  borderType?: LayerBorderType;
};

export type RectangleLayer = LayerWithGeometry & {
  type: LayerType.Rectangle;
};

export type EllipseLayer = LayerWithGeometry & {
  type: LayerType.Ellipse;
};

export type PathLayer = LayerWithGeometry & {
  type: LayerType.Path;
  points: number[][];
};

export type DiamondLayer = LayerWithGeometry & {
  type: LayerType.Diamond;
};

// export type TextLayer = {
//   type: LayerType.Text;
//   x: number;
//   y: number;
//   height: number;
//   width: number;
//   fill: Color;
//   value?: string;
// };

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Corner {
  TopCenter = "TOP_CENTER",
  TopLeft = "TOP_LEFT",
  TopRight = "TOP_RIGHT",
  BottomCenter = "BOTTOM_CENTER",
  BottomLeft = "BOTTOM_LEFT",
  BottomRight = "BOTTOM_RIGHT",
  MiddleLeft = "MIDDLE_LEFT",
  MiddleRight = "MIDDLE_RIGHT",
}

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type LockedState = {
  connectionId: string;
  lockedBy: string;
  lockedColor: string;
  lockedLayers: string[];
  lockedEdges: string[];
  status: "locked" | "unlocked";
};

export type CanvasState =
  | {
      mode: CanvasMode.Edge;
      origin?: Point;
      current?: Point;
      handleInfo?: {
        isInHandle: boolean;
        handlePosition: HandlePosition;
        layerId: string;
        layerType: LayerType;
        coordinates: Point;
      };
    }
  | {
      mode: CanvasMode.EdgeActive;
      origin?: Point;
      edgeId?: string;
    }
  | {
      mode: CanvasMode.EdgeDrawing;
      origin?: Point;
      current?: Point;
      edgeHandleInfo?: {
        handlePosition: "START" | "END";
        edge: Edge;
        coordinates: Point;
      };
      handleInfo?: {
        isInHandle: boolean;
        handlePosition: HandlePosition;
        layerId: string;
        layerType: LayerType;
        coordinates: Point;
      };
    }
  | {
      mode: CanvasMode.EdgeEditing;
      current: Point;
      edgeHandleInfo?: {
        isInHandle: boolean;
        handlePosition: "START" | "END";
        edge: Edge;
        coordinates: Point;
      };
      handleInfo?: {
        isInHandle: boolean;
        handlePosition: HandlePosition;
        layerId: string;
        layerType: LayerType;
        coordinates: Point;
      };
      // editingEdge: { id: string; handlePosition: "START" | "MIDDLE" | "END"; startPoint: Point };
    }
  | {
      mode: CanvasMode.EdgeSelected;
    }
  | {
      mode: CanvasMode.Exporting; // New mode for exporting
    }
  | {
      mode: CanvasMode.Grab;
    }
  | {
      mode: CanvasMode.Importing; // New mode for importing
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Diamond | LayerType.Path;
      current: Point;
    }
  | {
      mode: CanvasMode.LayerSelected;
    }
  | {
      mode: CanvasMode.None;
      current?: Point;
      hoveredEdgeId?: string;
      hoveredLayerId?: string;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      initialLayerBounds?: Layer[];
      connectedEdges?: Edge[];
      corner: Corner;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
      selectedLayersIds?: string[];
    }
  | {
      mode: CanvasMode.Tooling;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
      initialLayerBounds: Layer[];
      connectedEdges?: Edge[];
      alignments?: Alignment;
    }
  | {
      mode: CanvasMode.Typing;
      selectedLayerId?: string;
    };

export enum CanvasMode {
  None,
  Grab,
  Pressing,
  SelectionNet,
  LayerSelected,
  EdgeSelected,
  Inserting,
  Translating,
  Resizing,
  Pencil,
  Edge,
  EdgeActive,
  EdgeDrawing,
  EdgeEditing,
  Typing,
  Tooling,
  Exporting,
  Importing,
}
