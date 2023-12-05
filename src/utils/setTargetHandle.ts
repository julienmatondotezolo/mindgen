export function setTargetHandle(sourceHandle: string) {
  switch (sourceHandle) {
    case "left":
      return "right";
    case "right":
      return "left";
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    default:
      return "Invalid sourceHandle";
  }
}
