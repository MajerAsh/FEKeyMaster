import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const PuzzleContext = createContext();

export function PuzzleProvider({ children }) {
  const { token } = useAuth();
  const [puzzles, setPuzzles] = useState([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);

  const fetchPuzzles = async () => {
    const res = await fetch("http://localhost:3001/puzzles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setPuzzles(data);
  };

  return (
    <PuzzleContext.Provider
      value={{
        puzzles,
        setPuzzles,
        fetchPuzzles,
        selectedPuzzle,
        setSelectedPuzzle,
      }}
    >
      {children}
    </PuzzleContext.Provider>
  );
}

export function usePuzzles() {
  return useContext(PuzzleContext);
}
