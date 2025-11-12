import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";

const PuzzleContext = createContext();

export function PuzzleProvider({ children }) {
  const { token } = useAuth();
  const [puzzles, setPuzzles] = useState([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);

  const fetchPuzzles = async () => {
    try {
      const data = await apiFetch("/puzzles", {}, token);
      setPuzzles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch puzzles:", err);
      setPuzzles([]);
    }
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
