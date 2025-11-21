// the page with game options and cat smile

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

  // preload background images to avoid flicker when swapping
  useEffect(() => {
    const names = ["ZoomSmile.png", "ZoomIn.png"];
    const imgs = names.map((n) => {
      const i = new Image();
      i.src = `/images/${n}`;
      return i;
    });
    return () => imgs.forEach((i) => (i.src = ""));
  }, []);
  useEffect(() => {
    if (token && puzzles.length === 0) fetchPuzzles();
  }, [token, fetchPuzzles, puzzles.length]);

  // Protect this route: if there's no token, send the user to login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // every 20s toggle a smile for 2s
  useEffect(() => {
    // speed/slow the smile effect
    const SMILE_INTERVAL_MS = 5000; // how often to trigger the smile
    const SMILE_DURATION_MS = 800; // how long the smile stays

    let timeoutId = null;
    const interval = setInterval(() => {
      setBgSmile(true);
      // any previous timeout is cleared before creating a new one
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
