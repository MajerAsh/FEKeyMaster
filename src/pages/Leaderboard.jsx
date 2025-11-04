import { useNavigate } from "react-router-dom";
import "../styles/Leaderboard.css";

export default function Leaderboard() {
  const navigate = useNavigate();

  return (
    <div className="leader-root">
      <div className="leader-bg" />
      <div className="leader-panel">
        <h2>Leader Board (WIP)</h2>
        <p>Top scores will appear here. This view is under development.</p>
        <button onClick={() => navigate("/play")}>← Back to Play</button>
      </div>
    </div>
  );
}
