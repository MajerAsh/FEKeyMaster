import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePuzzles } from "../context/PuzzleContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Play.css";

export default function Play() {
  const { token } = useAuth();
  const { puzzles, fetchPuzzles } = usePuzzles();
  const navigate = useNavigate();

  const [bgSmile, setBgSmile] = useState(false);

  useEffect(() => {
    if (token && puzzles.length === 0) fetchPuzzles();
  }, [token, fetchPuzzles, puzzles.length]);

  // every 20s toggle a smile for 2s
  useEffect(() => {
    // configurable timings so we can easily speed/slow the effect
    const SMILE_INTERVAL_MS = 5000; // how often to trigger the smile
    const SMILE_DURATION_MS = 800; // how long the smile stays visible

    let timeoutId = null;
    const interval = setInterval(() => {
      setBgSmile(true);
      // ensure any previous timeout is cleared before creating a new one
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setBgSmile(false), SMILE_DURATION_MS);
    }, SMILE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const dialPuzzle = puzzles.find((p) => p.type === "dial");
  const pinPuzzle = puzzles.find((p) => p.type === "pin-tumbler");

  return (
    <div className="play-root">
      <div
        className="scene"
        style={{
          backgroundImage: `url(/images/${
            bgSmile ? "ZoomSmile.png" : "ZoomIn.png"
          })`,
        }}
      >
        <div className="play-panel">
          <h2>Select a Puzzle</h2>
          <div className="play-grid">
            <div className="tile">
              <h3>Dial Lock</h3>
              {dialPuzzle ? (
                <button onClick={() => navigate(`/puzzle/${dialPuzzle.id}`)}>
                  Play Dial Lock
                </button>
              ) : (
                <p>Not available</p>
              )}
            </div>

            <div className="tile">
              <h3>Pin Tumbler Lock</h3>
              {pinPuzzle ? (
                <button onClick={() => navigate(`/puzzle/${pinPuzzle.id}`)}>
                  Play Pin Tumbler
                </button>
              ) : (
                <p>Not available</p>
              )}
            </div>

            <div className="tile">
              <h3>Leader Board</h3>
              <Link to="/leaderboard">
                <button>View Leader Board</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
