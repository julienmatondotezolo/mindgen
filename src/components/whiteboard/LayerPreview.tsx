import React, { memo } from "react";

import { Layer, LayerType } from "@/_types";
import { Ellipse, Rectangle } from "@/components/whiteboard/layers";

interface LayerPreviewProps {
  layer: Layer;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor: string;
}

export const LayerPreview = memo(({ layer, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
  const id = layer.id;

  if (!layer) return null;

  switch (layer.type) {
    case LayerType.Ellipse:
      return <Ellipse id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;
    case LayerType.Rectangle:
      return <Rectangle id={id} layer={layer} onPointerDown={onLayerPointerDown} selectionColor={selectionColor} />;

    default:
      console.warn("Unknown layer type", layer);
      return null;
  }
});

LayerPreview.displayName = "LayerPreview";
