import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import "../styles/Home.css";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  function handlePlay() {
    if (user) return navigate("/play");
    setShowAuth(true);
  }

  return (
    <div className="home-root">
      <div
        className={`home-bg ${showAuth ? "bg-with-cat" : "bg-no-cat"}`}
        aria-hidden
      >
        {!showAuth && (
          <div className="swat-sprite" aria-hidden data-frame={0} />
        )}
      </div>

      <div className="home-content">
        {!showAuth && (
          <>
            <h1 className="title">Key Master</h1>
            <p className="subtitle">
              Pick, turn, and unlock — prove your skill.
            </p>
          </>
        )}

        <button className="play-btn" onClick={handlePlay} aria-label="Play">
          <span className="arrow">▶</span>
          <span className="play-text">Play</span>
        </button>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => navigate("/play")}
        />
      )}

      {/* decorative sprites are rendered inside the background (.swat-sprite)
          The old standalone <img className="cat-sprite"> was removed to avoid
          duplicate/bobbing overlays that interfered with placement. */}
    </div>
  );
}
