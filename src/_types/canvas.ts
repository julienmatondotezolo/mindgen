/* eslint-disable no-unused-vars */
export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
  scale: number;
};

export enum HandlePosition {
  Top,
  Left,
  Right,
  Bottom,
}

export type EdgeOrientation = "auto" | "0" | "90" | "-180" | "180" | "270";

export enum EdgeType {
  Solid,
  Dashed,
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
};

export enum LayerType {
  Note,
  Rectangle,
  Ellipse,
  Path,
}

export type LayerBorderType = "solid" | "dashed";

export type ValueStyle = {
  // fontSize: number;
  // fontFamily: string;
  // fontStyle: string;
  fontWeight: string;
  textTransform: string;
};

export type Layer = RectangleLayer | EllipseLayer | PathLayer | NoteLayer;

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

export type NoteLayer = LayerWithGeometry & {
  type: LayerType.Note;
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
      editingEdge: { id: string; handlePosition: "start" | "middle" | "end"; startPoint: Point };
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
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Note | LayerType.Path;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
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
}
