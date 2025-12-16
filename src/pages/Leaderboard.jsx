import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Leaderboard.css";
import { apiFetch } from "../lib/api";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [rows, setRows] = useState([]);
  // protect leaderboard - require login
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    apiFetch("/scores/leaderboard?limit=20", {}, token)
      .then((data) => {
        const payload = data && data.rows ? data.rows : data || [];
        setRows(payload);
      })
      .catch((err) => console.error("Failed to load leaderboard:", err));
  }, [token]);

  return (
    <div className="leader-root">
      <div
        className="scene"
        style={{ backgroundImage: `url(/images/KitchenNoCat.png)` }}
      >
        <div className="leader-panel">
          <h2>Leader Board (WIP)</h2>
          <p>Top scores will appear here. This view is under development.</p>
          <div className="leader-table-wrap">
            <table className="leader-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Dial Points</th>
                  <th>Pin Points</th>
                  <th>Badge Points</th>
                  <th>Total Points</th>
                  <th>Has Both</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No results yet</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.user_id || r.id || r.email}>
                      <td>{r.username || r.email || "-"}</td>
                      <td>{r.dial_points ?? r.dialPoints ?? 0}</td>
                      <td>{r.pin_points ?? r.pinPoints ?? 0}</td>
                      <td>{r.badge_points ?? r.badgePoints ?? 0}</td>
                      <td>{r.total_points ?? r.totalPoints ?? 0}</td>
                      <td>{r.has_both || r.hasBoth ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
