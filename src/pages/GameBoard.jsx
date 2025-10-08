//Puzzle fetch & set,Token usage, Error/message handling,handleAttempt integration, PinTumbler rendering
import { useParams, useNavigate } from "react-router-dom";
import { usePuzzles } from "../context/PuzzleContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PinTumbler from "../components/PinTumbler";

export default function GameBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { puzzles, fetchPuzzles } = usePuzzles();
  const { token } = useAuth();

  const [puzzle, setPuzzle] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (puzzles.length === 0) {
        await fetchPuzzles();
      }
      const found = puzzles.find((p) => p.id === parseInt(id));
      setPuzzle(found);
    }
    load();
  }, [id, puzzles, fetchPuzzles]);

  if (!puzzle) return <p>Loading puzzle...</p>;

  async function handleAttempt(attemptArray) {
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/puzzles/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          puzzle_id: puzzle.id,
          attempt: attemptArray,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("✅ Unlocked!");
      } else {
        setMessage("❌ Incorrect. Try again.");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  }

  let parsedCode = [];
  try {
    if (puzzle?.solution_code) {
      parsedCode = JSON.parse(puzzle.solution_code);
    }
  } catch (err) {
    console.error("Failed to parse puzzle.solution_code:", err);
  }

  return (
    <div>
      <button onClick={() => navigate("/")}>← Back to Puzzles</button>
      <h2>{puzzle.name}</h2>
      <p>{puzzle.prompt}</p>
      <PinTumbler pinCount={parsedCode.length || 5} onSubmit={handleAttempt} />
      {message && <p>{message}</p>}
    </div>
  );
}
