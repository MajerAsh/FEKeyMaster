//Puzzle fetch & set,Token usage, Error/message handling,handleAttempt integration, PinTumbler rendering
import { useParams, useNavigate } from "react-router-dom";
import { usePuzzles } from "../context/PuzzleContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PinTumbler from "../components/PinTumbler";
import "../styles/GameBoard.css";
import DialLock from "../components/DialLock";

export default function GameBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { puzzles, fetchPuzzles } = usePuzzles();
  const { token } = useAuth();

  const [puzzle, setPuzzle] = useState(null);
  const [message, setMessage] = useState("");

  // Auto-hide the unlocked overlay after a short delay when it appears
  useEffect(() => {
    if (message === "✅ Unlocked!") {
      const t = setTimeout(() => setMessage(""), 2500);
      return () => clearTimeout(t);
    }
  }, [message]);

  console.log("GameBoard id:", id, "puzzles:", puzzles);

  useEffect(() => {
    async function load() {
      if (puzzles.length === 0) {
        await fetchPuzzles();
      }
      const found = puzzles.find((p) => p.id === parseInt(id));
      setPuzzle(found);
      console.log("Found puzzle:", found);
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
  console.log(
    "parsedCode",
    parsedCode,
    "raw solution_code",
    puzzle?.solution_code
  );

  return (
    <div>
      <button onClick={() => navigate("/")}>← Back to Puzzles</button>
      <h2>{puzzle.name}</h2>
      <p>{puzzle.prompt}</p>

      {/* PUZZLE TYPE CONDITIONAL RENDERING */}
      {puzzle.type === "pin-tumbler" && (
        <PinTumbler
          pinCount={parsedCode.length}
          solutionCode={parsedCode}
          onSubmit={handleAttempt}
          onReset={() => setMessage("")}
        />
      )}

      {puzzle.type === "dial" && (
        <DialLock
          dialCount={parsedCode.length}
          solutionCode={parsedCode}
          onSubmit={handleAttempt}
        />
      )}

      {/* show centered overlay only for unlocked success */}
      {message === "✅ Unlocked!" && (
        <div className="unlocked-overlay" role="status" aria-live="polite">
          <span className="emoji">🔓</span>
          <span>Unlocked!</span>
        </div>
      )}

      {/* fallback message area for other feedback */}
      {message && message !== "✅ Unlocked!" && (
        <div className="unlocked message">{<p>{message}</p>}</div>
      )}
    </div>
  );
}
