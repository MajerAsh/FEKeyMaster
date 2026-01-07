import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Leaderboard.css";
import { apiFetch } from "../lib/api";

function formatUsername(username) {
  if (!username) return "Anonymous";
  const at = username.indexOf("@");
  return at === -1 ? username : username.slice(0, at);
}

function formatTime(secs) {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

function badgeIcons(badges) {
  // badges is JSON array from backend: ["treat_diallock","treat_pintumbler"]
  const set = new Set(Array.isArray(badges) ? badges : []);
  return {
    dial: set.has("treat_diallock"),
    pin: set.has("treat_pintumbler"),
    count: set.size,
  };
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [mode, setMode] = useState("overall"); // overall | dial | pin

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    apiFetch("/scores/leaderboard?limit=20", {}, token)
      .then((data) => setRows(Array.isArray(data) ? data : data?.rows || []))
      .catch((err) => console.error("Failed to load leaderboard:", err));
  }, [token]);

  const filtered = useMemo(() => {
    if (mode === "dial") return rows.filter((r) => (r.dial_points ?? 0) > 0);
    if (mode === "pin") return rows.filter((r) => (r.pin_points ?? 0) > 0);
    return rows;
  }, [rows, mode]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="leader-root">
      <div
        className="scene"
        style={{ backgroundImage: `url(/images/KitchenNoCat.png)` }}
      >
        <div className="leader-panel">
          <div className="leader-header">
            <h2 className="leader-title">Leaderboard</h2>

            <div className="leader-actions">
              <button onClick={() => navigate("/play")}>← Back</button>
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

          <div
            className="leader-tabs"
            role="tablist"
            aria-label="Leaderboard filter"
          >
            <button
              className={mode === "overall" ? "active" : ""}
              onClick={() => setMode("overall")}
            >
              Overall
            </button>
            <button
              className={mode === "dial" ? "active" : ""}
              onClick={() => setMode("dial")}
            >
              DialLock
            </button>
            <button
              className={mode === "pin" ? "active" : ""}
              onClick={() => setMode("pin")}
            >
              PinTumbler
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="leader-empty">No scores yet — go unlock a treat 🐟</p>
          ) : (
            <>
              {/* PODIUM */}
              <div className="podium">
                {top3.map((r, i) => {
                  const rank = i + 1;
                  const icons = badgeIcons(r.badges);
                  const best =
                    mode === "dial"
                      ? r.best_dial_time
                      : mode === "pin"
                      ? r.best_pin_time
                      : r.best_time;

                  return (
                    <div key={r.user_id} className={`podium-card rank-${rank}`}>
                      <div className="podium-rank">
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"} #{rank}
                      </div>

                      <div className="podium-name">
                        {formatUsername(r.username)}
                      </div>

                      <div className="podium-points">
                        {(r.total_points ?? 0).toLocaleString()} pts
                      </div>

                      <div className="podium-meta">
                        <span className="treats">
                          {icons.dial ? "🍬" : "⬜"} {icons.pin ? "🐟" : "⬜"}{" "}
                          <span className="muted">({icons.count})</span>
                        </span>
                        <span className="muted">Best: {formatTime(best)}</span>
                      </div>

                      {r.has_both ? (
                        <span className="tag">Both Locks</span>
                      ) : (
                        <span className="tag muted">In progress</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* LIST */}
              <div className="leader-list">
                {rest.map((r, idx) => {
                  const rank = idx + 4;
                  const icons = badgeIcons(r.badges);
                  const best =
                    mode === "dial"
                      ? r.best_dial_time
                      : mode === "pin"
                      ? r.best_pin_time
                      : r.best_time;

                  return (
                    <div className="leader-row" key={r.user_id}>
                      <div className="rank">#{rank}</div>
                      <div className="name">{formatUsername(r.username)}</div>

                      <div className="mini">
                        <div className="label">Total</div>
                        <div className="value">
                          {(r.total_points ?? 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="mini">
                        <div className="label">Treats</div>
                        <div className="value">
                          {icons.dial ? "🍬" : "⬜"} {icons.pin ? "🐟" : "⬜"}
                        </div>
                      </div>

                      <div className="mini">
                        <div className="label">Best</div>
                        <div className="value">{formatTime(best)}</div>
                      </div>

                      <div className="mini right">
                        {r.has_both ? <span className="tag">Both</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
