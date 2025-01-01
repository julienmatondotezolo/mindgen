/* eslint-disable no-unused-vars */
export type Camera = {
  x: number;
  y: number;
  scale: number;
};

export type Color = {
  r: number;
  g: number;
  b: number;
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

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
      current?: Point;
    }
  | {
      mode: CanvasMode.Grab;
    }
  | {
      mode: CanvasMode.EdgeActive;
      origin?: Point;
    }
  | {
      mode: CanvasMode.Edge;
      origin?: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.EdgeDrawing;
    }
  | {
      mode: CanvasMode.EdgeEditing;
      editingEdge: { id: string; handlePosition: "START" | "MIDDLE" | "END"; startPoint: Point };
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Diamond | LayerType.Path;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
      initialLayerBounds: Layer;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Typing;
    }
  | {
      mode: CanvasMode.Tooling;
    }
  | {
      mode: CanvasMode.Exporting; // New mode for exporting
    }
  | {
      mode: CanvasMode.Importing; // New mode for exporting
    };
export enum CanvasMode {
  None,
  Grab,
  Pressing,
  SelectionNet,
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
