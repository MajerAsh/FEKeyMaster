import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Leaderboard.css";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  // protect leaderboard - require login
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  return (
    <div className="leader-root">
      <div
        className="scene"
        style={{ backgroundImage: `url(/images/KitchenNoCat.png)` }}
      >
        <div className="leader-panel">
          <h2>Leader Board (WIP)</h2>
          <p>Top scores will appear here. This view is under development.</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => navigate("/play")}>← Back to Play</button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
