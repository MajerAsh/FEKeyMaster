import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePuzzles } from "../context/PuzzleContext";
import { Link } from "react-router-dom";

export default function Play() {
  const { token } = useAuth();
  const { puzzles, selectedPuzzle, setSelectedPuzzle, fetchPuzzles } =
    usePuzzles();

  const [attempt, setAttempt] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && puzzles.length === 0) {
      fetchPuzzles();
    }
  }, [token, fetchPuzzles, puzzles.length]);

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
          puzzle_id: selectedPuzzle.id,
          attempt: attempt.split(",").map((n) => parseInt(n.trim())),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Correct! Puzzle solved.");
      } else {
        setMessage("❌ Incorrect. Try again.");
      }
    } catch {
      setMessage("Error submitting attempt.");
    }
  }

  return (
    <div>
      <h2>🔐 Available Puzzles</h2>
      <ul>
        {puzzles.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>
            <p>{p.prompt}</p>
            <Link to={`/puzzle/${p.id}`}>
              <button>Play</button>
            </Link>
          </li>
        ))}
      </ul>

      {selectedPuzzle && (
        <form onSubmit={handleSubmit}>
          <h3>{selectedPuzzle.name}</h3>
          <input
            type="text"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="e.g. 40,30,50,20,60"
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
