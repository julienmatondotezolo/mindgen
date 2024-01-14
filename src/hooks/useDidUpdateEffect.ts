import { useEffect, useState } from "react";

function useDidUpdateEffect(callback: () => void, dependencies: any[]) {
  const [hasUpdated, setHasUpdated] = useState(false);

  useEffect(() => {
    if (hasUpdated) {
      callback();
    } else {
      setHasUpdated(true);
    }
  }, dependencies);
}

export { useDidUpdateEffect };
