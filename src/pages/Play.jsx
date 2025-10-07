import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Play() {
  const { token } = useAuth();
  const [puzzles, setPuzzles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [attempt, setAttempt] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPuzzles() {
      try {
        const res = await fetch("http://localhost:3001/puzzles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load puzzles");
        setPuzzles(data);
      } catch (err) {
        setError(err.message);
      }
    }

    if (token) fetchPuzzles();
  }, [token]);

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
          puzzle_id: selectedId,
          attempt: attempt.split(",").map((n) => parseInt(n.trim())),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Correct! Puzzle solved.");
      } else {
        setMessage("❌ Incorrect. Try again.");
      }
    } catch (err) {
      setMessage("Error submitting attempt.");
    }
  }

  return (
    <div>
      <h2>🔐 Available Puzzles</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {puzzles.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong>
            <p>{p.prompt}</p>
            <button onClick={() => setSelectedId(p.id)}>
              {selectedId === p.id ? "Selected" : "Play"}
            </button>
          </li>
        ))}
      </ul>

      {selectedId && (
        <form onSubmit={handleSubmit}>
          <h3>Enter your attempt (comma-separated numbers):</h3>
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
