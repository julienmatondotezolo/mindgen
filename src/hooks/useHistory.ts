import { useRef, useState } from "react";

function useHistory() {
  const [history, setHistory] = useState([]);
  const isPaused = useRef(false);

  // Function to add new entries to the history
  const addToHistory = (newEntry) => {
    if (!isPaused.current) {
      setHistory((prevHistory) => [...prevHistory, newEntry]);
    }
  };

  // Function to pause updates
  const pauseUpdates = () => {
    isPaused.current = true;
  };

  // Function to resume updates
  const resumeUpdates = () => {
    isPaused.current = false;
  };

  return { history, addToHistory, pauseUpdates, resumeUpdates };
}

export { useHistory };
