import { useParams, useNavigate } from "react-router-dom";
import { usePuzzles } from "../context/PuzzleContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function GameBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { puzzles, fetchPuzzles } = usePuzzles();
  const { token } = useAuth();

  const [puzzle, setPuzzle] = useState(null);
  const [attempt, setAttempt] = useState("");
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

  async function handleSubmit(e) {
    e.preventDefault();
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
          attempt: attempt.split(",").map((n) => parseInt(n.trim())),
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

  return (
    <div>
      <button onClick={() => navigate("/")}>← Back to Puzzles</button>
      <h2>{puzzle.name}</h2>
      <p>{puzzle.prompt}</p>

      {/* Temporary input for testing */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
          placeholder="e.g. 40,30,50,20,60"
        />
        <button type="submit">Submit</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
