//Puzzle fetch & set,Token usage, Error/message handling,handleAttempt integration, PinTumbler rendering
import { useParams, useNavigate } from "react-router-dom";
import { usePuzzles } from "../context/PuzzleContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import PinTumbler from "../components/PinTumbler";
import "../styles/GameBoard.css";
import OverlayMessage from "../components/OverlayMessage";
import DialLock from "../components/DialLock";

export default function GameBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { puzzles, fetchPuzzles } = usePuzzles();
  const { token } = useAuth();

  const [puzzle, setPuzzle] = useState(null);
  const [message, setMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const { logout } = useAuth();

  // NOTE: message auto-hide is handled by the reusable OverlayMessage component

  console.log("GameBoard id:", id, "puzzles:", puzzles);

  useEffect(() => {
    async function load() {
      if (puzzles.length === 0) {
        await fetchPuzzles();
      }
      const found = puzzles.find((p) => p.id === parseInt(id));
      setPuzzle(found);
      console.log("Found puzzle:", found);
    }
    load();
  }, [id, puzzles, fetchPuzzles]);

  if (!puzzle) return <p>Loading puzzle...</p>;

  // Optimistic attempt handling: check locally first so UI is instant,
  // then persist to the server in the background. This avoids waiting for
  // a network round-trip to show the unlock feedback.
  async function handleAttempt(attemptArray) {
    setMessage("");

    // parse solution locally
    let localCode = [];
    try {
      if (puzzle?.solution_code) localCode = JSON.parse(puzzle.solution_code);
    } catch (err) {
      console.error(
        "Failed to parse puzzle.solution_code for local check:",
        err
      );
    }

    const localMatch =
      Array.isArray(attemptArray) &&
      attemptArray.length === localCode.length &&
      attemptArray.every((val, i) => Math.abs(val - localCode[i]) <= 2);

    if (localMatch) {
      // Immediately show success in the UI
      setMessage("✅ Unlocked!");
      setUnlocked(true);
      // Persist result but don't block UI; log any server-side errors
      apiFetch(
        "/puzzles/solve",
        {
          method: "POST",
          body: JSON.stringify({ puzzle_id: puzzle.id, attempt: attemptArray }),
        },
        token
      )
        .then((data) => {
          if (!data || !data.success) {
            console.warn("Server did not accept attempt:", data);
            // If server rejects, inform the user but do not revert the UI abruptly
            setMessage("✅ Unlocked! (local) — server did not persist result");
          }
        })
        .catch((err) => {
          console.error("Error persisting attempt:", err);
          setMessage("✅ Unlocked! (local) — save failed");
        });
      return;
    }

    // Not a local match: submit to server and wait for official response
    try {
      const data = await apiFetch(
        "/puzzles/solve",
        {
          method: "POST",
          body: JSON.stringify({ puzzle_id: puzzle.id, attempt: attemptArray }),
        },
        token
      );

      if (data && data.success) {
        setMessage("✅ Unlocked!");
        setUnlocked(true);
      } else {
        setMessage("❌ Incorrect. Try again.");
      }
    } catch (err) {
      console.error("Error submitting attempt:", err);
      setMessage("Something went wrong.");
    }
  }

  let parsedCode = [];
  try {
    if (puzzle?.solution_code) {
      parsedCode = JSON.parse(puzzle.solution_code);
    }
  } catch (err) {
    console.error("Failed to parse puzzle.solution_code:", err);
  }
  console.log(
    "parsedCode",
    parsedCode,
    "raw solution_code",
    puzzle?.solution_code
  );

  return (
    <div className="game-root">
      <div
        className="scene"
        style={{ backgroundImage: `url(/images/Paws.png)` }}
      >
        <div className="game-content">
          <div className="game-actions">
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

          <h2>{puzzle.name}</h2>
          <p>{puzzle.prompt}</p>

          {/* PUZZLE TYPE CONDITIONAL RENDERING */}
          {puzzle.type === "pin-tumbler" && (
            <PinTumbler
              pinCount={parsedCode.length}
              solutionCode={parsedCode}
              onSubmit={handleAttempt}
              onReset={() => {
                setMessage("");
                setUnlocked(false);
              }}
              unlocked={unlocked}
            />
          )}

          {puzzle.type === "dial" && (
            <DialLock
              dialCount={parsedCode.length}
              solutionCode={parsedCode}
              onSubmit={handleAttempt}
              unlocked={unlocked}
              onReset={() => {
                setMessage("");
                setUnlocked(false);
              }}
            />
          )}

          {/* reusable overlay for any message */}
          <OverlayMessage
            message={message}
            type={
              message?.startsWith("✅")
                ? "success"
                : message?.startsWith("❌")
                ? "error"
                : "info"
            }
            autoHide={true}
            duration={2500}
            onClose={() => setMessage("")}
          />
        </div>
      </div>
    </div>
  );
}
