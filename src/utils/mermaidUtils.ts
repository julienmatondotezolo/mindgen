import { nanoid } from "nanoid";

import {
  Color,
  DiamondLayer,
  Edge,
  EdgeShape,
  EdgeType,
  EllipseLayer,
  HandlePosition,
  Layer,
  LayerType,
  RectangleLayer,
} from "@/_types/canvas";

import { getHandlePosition } from "./layerUtils";

// Default colors for different node types
const DEFAULT_COLORS = {
  RECTANGLE: { r: 77, g: 106, b: 255 },
  ELLIPSE: { r: 245, g: 158, b: 11 },
  DIAMOND: { r: 124, g: 58, b: 237 },
  START: { r: 51, g: 204, b: 51 },
  END: { r: 255, g: 87, b: 51 },
};

// Default edge colors
const DEFAULT_EDGE_COLOR = { r: 180, g: 191, b: 204 };
const DEFAULT_HOVER_COLOR = { r: 77, g: 106, b: 255 };

// Flowchart direction types
type FlowchartDirection = "TD" | "TB" | "LR" | "RL" | "BT";

// Interface for parsed mermaid nodes
interface MermaidNode {
  id: string;
  text: string;
  shape: "rectangle" | "diamond" | "circle";
}

// Interface for parsed mermaid edges
interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
}

/**
 * Parses the flowchart direction from the mermaid code
 */
function parseFlowchartDirection(mermaidCode: string): FlowchartDirection {
  const lines = mermaidCode.split("\n").map((line) => line.trim());

  for (const line of lines) {
    const match = line.match(/^flowchart\s+(TD|TB|LR|RL|BT)$/i);

    if (match) {
      return match[1].toUpperCase() as FlowchartDirection;
    }
    // Handle case where direction is missing (default to TD)
    if (line.match(/^flowchart$/i)) {
      return "TD";
    }
  }

  return "TD"; // Default direction
}

/**
 * Parses a Mermaid flowchart string and extracts nodes and edges
 */
function parseMermaidFlowchart(mermaidCode: string): {
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  direction: FlowchartDirection;
} {
  const direction = parseFlowchartDirection(mermaidCode);

  const lines = mermaidCode
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("flowchart"));

  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];
  const nodeMap = new Map<string, { text: string; shape: "rectangle" | "diamond" | "circle" }>();

  // Function to extract node definition from text
  const extractNodeDef = (
    nodeText: string,
  ): { id: string; text: string; shape: "rectangle" | "diamond" | "circle" } | null => {
    // Rectangle: A[Text]
    const rectMatch = nodeText.match(/^(\w+)\[([^\]]+)\]$/);

    if (rectMatch) {
      return { id: rectMatch[1], text: rectMatch[2], shape: "rectangle" };
    }

    // Diamond: B{Text}
    const diamondMatch = nodeText.match(/^(\w+)\{([^}]+)\}$/);

    if (diamondMatch) {
      return { id: diamondMatch[1], text: diamondMatch[2], shape: "diamond" };
    }

    // Circle: C((Text))
    const circleMatch = nodeText.match(/^(\w+)\(\(([^)]+)\)\)$/);

    if (circleMatch) {
      return { id: circleMatch[1], text: circleMatch[2], shape: "circle" };
    }

    return null;
  };

  for (const line of lines) {
    // Parse edges with various arrow syntaxes
    // Handle: A --> B, A -->|Label| B, A[Text] --> B{Text2}, A --> C((Text3))
    const arrowMatches = [
      // Pattern: anything -->|Label| anything
      line.match(/^(.+?)\s*-->\s*\|\s*([^|]+)\s*\|\s*(.+)$/),
      // Pattern: anything --> anything
      line.match(/^(.+?)\s*-->\s*(.+)$/),
    ];

    for (const arrowMatch of arrowMatches) {
      if (arrowMatch) {
        let fromText: string, toText: string, label: string | undefined;

        if (arrowMatch.length === 4) {
          // Has label: A -->|Label| B
          [, fromText, label, toText] = arrowMatch;
        } else {
          // No label: A --> B
          [, fromText, toText] = arrowMatch;
        }

        fromText = fromText.trim();
        toText = toText.trim();

        // Extract node definitions if they exist
        const fromNode = extractNodeDef(fromText);
        const toNode = extractNodeDef(toText);

        // Get node IDs (either from definition or just the ID)
        const fromId = fromNode ? fromNode.id : fromText;
        const toId = toNode ? toNode.id : toText;

        // Store node definitions if found
        if (fromNode && !nodeMap.has(fromNode.id)) {
          nodeMap.set(fromNode.id, { text: fromNode.text, shape: fromNode.shape });
        }
        if (toNode && !nodeMap.has(toNode.id)) {
          nodeMap.set(toNode.id, { text: toNode.text, shape: toNode.shape });
        }

        // Add edge
        edges.push({ from: fromId, to: toId, label: label?.trim() });
        break; // Found a match, don't try other patterns
      }
    }

    // Also check for standalone node definitions
    const standaloneNode = extractNodeDef(line);

    if (standaloneNode && !nodeMap.has(standaloneNode.id)) {
      nodeMap.set(standaloneNode.id, { text: standaloneNode.text, shape: standaloneNode.shape });
    }
  }

  // Convert nodeMap to nodes array
  for (const [id, nodeInfo] of nodeMap.entries()) {
    nodes.push({ id, text: nodeInfo.text, shape: nodeInfo.shape });
  }

  // Add any missing nodes that are referenced in edges but not defined
  for (const edge of edges) {
    if (!nodeMap.has(edge.from)) {
      let text = edge.from;

      if (edge.from.toLowerCase() === "e") {
        text = "End";
      }
      nodes.push({ id: edge.from, text, shape: "rectangle" });
      nodeMap.set(edge.from, { text, shape: "rectangle" });
    }
    if (!nodeMap.has(edge.to)) {
      let text = edge.to;

      if (edge.to.toLowerCase() === "e") {
        text = "End";
      }
      nodes.push({ id: edge.to, text, shape: "rectangle" });
      nodeMap.set(edge.to, { text, shape: "rectangle" });
    }
  }

  return { nodes, edges, direction };
}

/**
 * Calculates positions for nodes based on flowchart direction
 */
function calculateNodePositions(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  direction: FlowchartDirection = "TD",
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  // Create adjacency lists
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();

  for (const edge of edges) {
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);

    outgoing.get(edge.from)!.push(edge.to);
    incoming.get(edge.to)!.push(edge.from);
  }

  // Find root nodes (no incoming edges)
  const rootNodes = nodes.filter((node) => !incoming.has(node.id) || incoming.get(node.id)!.length === 0);

  // Basic layering algorithm
  const layers: string[][] = [];
  const visited = new Set<string>();
  const nodeToLayer = new Map<string, number>();

  // BFS to assign layers
  const queue: { nodeId: string; layer: number }[] = [];

  // Start with root nodes at layer 0
  for (const root of rootNodes) {
    queue.push({ nodeId: root.id, layer: 0 });
  }

  while (queue.length > 0) {
    const { nodeId, layer } = queue.shift()!;

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    nodeToLayer.set(nodeId, layer);

    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(nodeId);

    // Add children to next layer
    const children = outgoing.get(nodeId) || [];

    for (const child of children) {
      if (!visited.has(child)) {
        queue.push({ nodeId: child, layer: layer + 1 });
      }
    }
  }

  // Handle disconnected nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const layer = layers.length;

      if (!layers[layer]) layers[layer] = [];
      layers[layer].push(node.id);
      nodeToLayer.set(node.id, layer);
    }
  }

  // Calculate positions based on direction
  const spacing = 280; // Distance between nodes
  const layerSpacing = 300; // Distance between layers

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layer = layers[layerIndex];

    for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
      const nodeId = layer[nodeIndex];
      let x: number, y: number;

      // Calculate positions based on direction
      switch (direction) {
        case "TD":
        case "TB":
          // Top to Bottom (default)
          x = (nodeIndex - (layer.length - 1) / 2) * spacing + 264;
          y = layerIndex * layerSpacing - 464;
          break;

        case "LR":
          // Left to Right
          x = layerIndex * layerSpacing - 464;
          y = (nodeIndex - (layer.length - 1) / 2) * spacing + 0;
          break;

        case "RL":
          // Right to Left
          x = -layerIndex * layerSpacing + 464;
          y = (nodeIndex - (layer.length - 1) / 2) * spacing + 0;
          break;

        case "BT":
          // Bottom to Top
          x = (nodeIndex - (layer.length - 1) / 2) * spacing + 264;
          y = -layerIndex * layerSpacing + 464;
          break;

        default:
          // Fallback to TD
          x = (nodeIndex - (layer.length - 1) / 2) * spacing + 264;
          y = layerIndex * layerSpacing - 464;
      }

      positions.set(nodeId, { x, y });
    }
  }

  return positions;
}

/**
 * Determines handle positions based on flowchart direction and node positions
 */
function getOptimalHandlePositions(
  fromLayer: Layer,
  toLayer: Layer,
  direction: FlowchartDirection,
): { handleStart: HandlePosition; handleEnd: HandlePosition } {
  const fromCenterX = fromLayer.x + fromLayer.width / 2;
  const fromCenterY = fromLayer.y + fromLayer.height / 2;
  const toCenterX = toLayer.x + toLayer.width / 2;
  const toCenterY = toLayer.y + toLayer.height / 2;

  // Default handle positions based on direction
  switch (direction) {
    case "TD":
    case "TB":
      // Top to Bottom - prefer vertical connections
      if (fromCenterY < toCenterY) {
        return { handleStart: HandlePosition.Bottom, handleEnd: HandlePosition.Top };
      } else {
        return { handleStart: HandlePosition.Top, handleEnd: HandlePosition.Bottom };
      }

    case "LR":
      // Left to Right - prefer horizontal connections
      if (fromCenterX < toCenterX) {
        return { handleStart: HandlePosition.Right, handleEnd: HandlePosition.Left };
      } else {
        return { handleStart: HandlePosition.Left, handleEnd: HandlePosition.Right };
      }

    case "RL":
      // Right to Left - prefer horizontal connections (reversed)
      if (fromCenterX > toCenterX) {
        return { handleStart: HandlePosition.Left, handleEnd: HandlePosition.Right };
      } else {
        return { handleStart: HandlePosition.Right, handleEnd: HandlePosition.Left };
      }

    case "BT":
      // Bottom to Top - prefer vertical connections (reversed)
      if (fromCenterY > toCenterY) {
        return { handleStart: HandlePosition.Top, handleEnd: HandlePosition.Bottom };
      } else {
        return { handleStart: HandlePosition.Bottom, handleEnd: HandlePosition.Top };
      }

    default:
      // Fallback to auto-detection
      if (Math.abs(fromCenterX - toCenterX) > Math.abs(fromCenterY - toCenterY)) {
        // Horizontal connection
        if (fromCenterX < toCenterX) {
          return { handleStart: HandlePosition.Right, handleEnd: HandlePosition.Left };
        } else {
          return { handleStart: HandlePosition.Left, handleEnd: HandlePosition.Right };
        }
      } else {
        // Vertical connection
        if (fromCenterY < toCenterY) {
          return { handleStart: HandlePosition.Bottom, handleEnd: HandlePosition.Top };
        } else {
          return { handleStart: HandlePosition.Top, handleEnd: HandlePosition.Bottom };
        }
      }
  }
}

/**
 * Converts a Mermaid flowchart to the specified JSON format
 */
export function mermaidToJson(mermaidCode: string): { layers: Layer[]; edges: Edge[] } {
  const { nodes: mermaidNodes, edges: mermaidEdges, direction } = parseMermaidFlowchart(mermaidCode);
  const positions = calculateNodePositions(mermaidNodes, mermaidEdges, direction);

  const layers: Layer[] = [];
  const edges: Edge[] = [];
  const nodeIdMap = new Map<string, string>(); // Original ID -> New ID mapping

  // Create layers from nodes
  for (const node of mermaidNodes) {
    const newId = nanoid();

    nodeIdMap.set(node.id, newId);
    const position = positions.get(node.id) || { x: 0, y: 0 };

    let fill: Color;
    let width = 200;
    let height = 60;

    switch (node.shape) {
      case "diamond": {
        fill = DEFAULT_COLORS.DIAMOND;
        width = 200;
        height = 200;

        const diamondLayer: DiamondLayer = {
          type: LayerType.Diamond,
          id: newId,
          x: position.x,
          y: position.y,
          height,
          width,
          fill,
          value: node.text,
          valueStyle: undefined,
          borderColor: undefined,
          borderWidth: undefined,
          borderType: undefined,
        };

        layers.push(diamondLayer);
        break;
      }

      case "circle": {
        // Set color based on text content
        if (node.text.toLowerCase().includes("start") || node.text.toLowerCase().includes("begin")) {
          fill = DEFAULT_COLORS.START;
        } else if (node.text.toLowerCase().includes("end") || node.text.toLowerCase().includes("stop")) {
          fill = DEFAULT_COLORS.END;
        } else {
          fill = DEFAULT_COLORS.ELLIPSE;
        }

        // Make circles more square-like
        width = 180;
        height = 180;

        const ellipseLayer: EllipseLayer = {
          type: LayerType.Ellipse,
          id: newId,
          x: position.x,
          y: position.y,
          height,
          width,
          fill,
          value: node.text,
          valueStyle: undefined,
          borderColor: undefined,
          borderWidth: undefined,
          borderType: undefined,
        };

        layers.push(ellipseLayer);
        break;
      }

      case "rectangle":
      default: {
        // Set color based on text content
        if (node.text.toLowerCase().includes("start") || node.text.toLowerCase().includes("begin")) {
          fill = DEFAULT_COLORS.START;
        } else if (node.text.toLowerCase().includes("end") || node.text.toLowerCase().includes("stop")) {
          fill = DEFAULT_COLORS.END;
        } else {
          fill = DEFAULT_COLORS.RECTANGLE;
        }

        const rectangleLayer: RectangleLayer = {
          type: LayerType.Rectangle,
          id: newId,
          x: position.x,
          y: position.y,
          height,
          width,
          fill,
          value: node.text,
          valueStyle: undefined,
          borderColor: undefined,
          borderWidth: undefined,
          borderType: undefined,
        };

        layers.push(rectangleLayer);
        break;
      }
    }
  }

  // Create edges from connections
  for (const mermaidEdge of mermaidEdges) {
    const fromLayerId = nodeIdMap.get(mermaidEdge.from);
    const toLayerId = nodeIdMap.get(mermaidEdge.to);

    if (!fromLayerId || !toLayerId) continue;

    const fromLayer = layers.find((l) => l.id === fromLayerId);
    const toLayer = layers.find((l) => l.id === toLayerId);

    if (!fromLayer || !toLayer) continue;

    // Get optimal handle positions based on direction
    const { handleStart, handleEnd } = getOptimalHandlePositions(fromLayer, toLayer, direction);

    // Calculate exact connection points
    const startPoint = getConnectionPoint(fromLayer, handleStart);
    const endPoint = getConnectionPoint(toLayer, handleEnd);

    const edge: Edge = {
      id: nanoid(),
      arrowStart: undefined,
      arrowEnd: true,
      handleStart,
      handleEnd,
      fromLayerId,
      toLayerId,
      start: startPoint,
      end: endPoint,
      controlPoint1: undefined,
      controlPoint2: undefined,
      color: DEFAULT_EDGE_COLOR,
      hoverColor: DEFAULT_HOVER_COLOR,
      thickness: 2,
      orientation: "auto",
      type: EdgeType.Solid,
      shape: EdgeShape.Line,
      label: mermaidEdge.label || "",
    };

    edges.push(edge);
  }

  return { layers, edges };
}

/**
 * Helper function to get connection point for a layer at a specific handle position
 */
function getConnectionPoint(layer: Layer, position: HandlePosition): { x: number; y: number } {
  const { handlePositions } = getHandlePosition(layer);

  // Find the handle position that matches the requested position
  const handle = handlePositions.find((h) => h.position === position);

  if (handle) {
    return { x: handle.x, y: handle.y };
  }

  // Fallback to the original calculation if handle not found
  switch (position) {
    case HandlePosition.Top:
      return { x: layer.x + layer.width / 2, y: layer.y };
    case HandlePosition.Right:
      return { x: layer.x + layer.width, y: layer.y + layer.height / 2 };
    case HandlePosition.Bottom:
      return { x: layer.x + layer.width / 2, y: layer.y + layer.height };
    case HandlePosition.Left:
      return { x: layer.x, y: layer.y + layer.height / 2 };
  }
}

/**
 * Converts layers and edges back to Mermaid format (reverse operation)
 * This is the missing function that was being imported throughout the codebase
 */
export function convertToMermaid(layers: Layer[], edges: Edge[]): string {
  if (!layers.length) return "";

  const mermaidLines = ["flowchart TD"];

  // Add node definitions
  for (const layer of layers) {
    const nodeId = layer.id.replace(/[^a-zA-Z0-9]/g, ""); // Clean ID for mermaid
    let nodeDefinition = "";

    switch (layer.type) {
      case LayerType.Rectangle:
        nodeDefinition = `    ${nodeId}[${layer.value || layer.id}]`;
        break;
      case LayerType.Diamond:
        nodeDefinition = `    ${nodeId}{${layer.value || layer.id}}`;
        break;
      case LayerType.Ellipse:
        nodeDefinition = `    ${nodeId}((${layer.value || layer.id}))`;
        break;
      default:
        nodeDefinition = `    ${nodeId}[${layer.value || layer.id}]`;
    }

    mermaidLines.push(nodeDefinition);
  }

  // Add edge connections
  for (const edge of edges) {
    const fromLayer = layers.find((l) => l.id === edge.fromLayerId);
    const toLayer = layers.find((l) => l.id === edge.toLayerId);

    if (fromLayer && toLayer) {
      const fromId = fromLayer.id.replace(/[^a-zA-Z0-9]/g, "");
      const toId = toLayer.id.replace(/[^a-zA-Z0-9]/g, "");

      let connection = `    ${fromId} --> ${toId}`;

      if (edge.label) {
        connection = `    ${fromId} -->|${edge.label}| ${toId}`;
      }

      mermaidLines.push(connection);
    }
  }

  return mermaidLines.join("\n");
}
