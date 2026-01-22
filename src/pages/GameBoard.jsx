//Puzzle fetch & set,Token usage,Demo mode, Error/message handling,handleAttempt integration, PinTumbler rendering

import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { usePuzzles } from "../context/PuzzleContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { getDemoPuzzle } from "../demo/demoPuzzles";
import PinTumbler from "../components/PinTumbler";
import "../styles/GameBoard.css";
import OverlayMessage from "../components/OverlayMessage";
import DialLock from "../components/DialLock";
import Timer from "../components/Timer";

export default function GameBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { puzzles, fetchPuzzles } = usePuzzles();
  const { token } = useAuth();

  const [puzzle, setPuzzle] = useState(null);
  const [message, setMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [setElapsedSeconds] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const { logout } = useAuth();

  const [searchParams] = useSearchParams();
  const demo = searchParams.get("demo");
  const isDemo = demo === "dial" || demo === "pin" || demo === "1";

  console.log("GameBoard id:", id, "puzzles:", puzzles);

  useEffect(() => {
    async function load() {
      if (isDemo) {
        const demoType =
          demo === "pin" ? "pin" : demo === "dial" ? "dial" : null;
        const pid = Number.parseInt(id, 10);
        const p = getDemoPuzzle(Number.isFinite(pid) ? pid : null, demoType);
        setPuzzle(p);
        console.log("Found DEMO puzzle:", p);
        return;
      }
      // Non-demo token
      if (!token) {
        navigate("/");
        return;
      }

      if (puzzles.length === 0) {
        await fetchPuzzles();
      }
      const found = puzzles.find((p) => p.id === parseInt(id));
      setPuzzle(found);
      console.log("Found puzzle:", found);
    }
    load();
  }, [id, puzzles, fetchPuzzles, token, isDemo, demo, navigate]);

  useEffect(() => {
    if (puzzle?.type === "dial") {
      document.body.classList.add("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [puzzle?.type]);

  if (!puzzle) return <p>Loading puzzle...</p>;

  async function handleAttempt(attemptArray) {
    // increment attempts each time Unlock is pressed
    setAttempts((a) => a + 1);
    setMessage("");

    // parse solution locally
    let localCode = [];
    try {
      if (puzzle?.solution_code) localCode = JSON.parse(puzzle.solution_code);
    } catch (err) {
      console.error(
        "Failed to parse puzzle.solution_code for local check:",
        err,
      );
    }

    const localMatch =
      Array.isArray(attemptArray) &&
      attemptArray.length === localCode.length &&
      attemptArray.every((val, i) => Math.abs(val - localCode[i]) <= 2);

    if (localMatch) {
      setMessage("Unlocked!");
      setUnlocked(true);

      if (isDemo) return;
      // Persist result but don't block UI; log any server-side errors
      apiFetch(
        "/puzzles/solve",
        {
          method: "POST",
          body: JSON.stringify({ puzzle_id: puzzle.id, attempt: attemptArray }),
        },
        token,
      )
        .then((data) => {
          if (!data || !data.success) {
            console.warn("Server did not accept attempt:", data);
            setMessage("Unlocked! (local) — server did not persist result");
          }
        })
        .catch((err) => {
          console.error("Error persisting attempt:", err);
          setMessage("Unlocked! (local) — save failed");
        });
      return;
    }

    // Demo mode for deep link
    if (isDemo) {
      setMessage("Incorrect. Try again.");
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
        token,
      );

      if (data && data.success) {
        setMessage("Unlocked!");
        setUnlocked(true);
      } else {
        setMessage("Incorrect. Try again.");
      }
    } catch (err) {
      console.error("Error submitting attempt:", err);
      setMessage("Something went wrong.");
    }
  }

  // Submit the score to backend when puzzle is unlocked and timer stops
  async function submitScore(finalElapsedSeconds) {
    // guard: only submit once
    if (finalElapsedSeconds == null) return;
    setElapsedSeconds(finalElapsedSeconds);
    const gameName = puzzle.type === "dial" ? "DialLock" : "PinTumbler";
    try {
      const res = await apiFetch(
        "/scores",
        {
          method: "POST",
          body: JSON.stringify({
            game: gameName,
            puzzleId: puzzle.id,
            elapsedSeconds: finalElapsedSeconds,
            attempts,
          }),
        },
        token,
      );
      if (res && res.awardedBadge) {
        setMessage(
          (m) => (m ? m + " " : "") + `Badge: ${res.awardedBadge.name}`,
        );
      }
    } catch (err) {
      console.error("Failed to submit score:", err);
    }
  }

  let parsedCode = [];
  try {
    if (puzzle?.solution_code) {
      /* NOTE: solution_code should NOT be returned from the server for deployed DBs.
       If present (local dev), parse it. Otherwise fall back to a sensible
     default length per puzzle type so the UI can render without revealing answers.*/
      parsedCode = JSON.parse(puzzle.solution_code);
    } else {
      if (puzzle.type === "pin-tumbler") parsedCode = Array(5).fill(0);
      else if (puzzle.type === "dial") parsedCode = Array(3).fill(0);
      else parsedCode = [];
    }
  } catch (err) {
    console.error("Failed to parse puzzle.solution_code:", err);
  }
  console.log(
    "parsedCode",
    parsedCode,
    "raw solution_code",
    puzzle?.solution_code,
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
          {/*If/when time will be displayed:
          elapsedSeconds != null && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
              Time: {elapsedSeconds}s • Attempts: {attempts}
            </div>
          )*/}
          {/* Demo mode: text indicator */}
          {isDemo && (
            <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Demo Mode — deep link preview
            </div>
          )}

          {/* Puzzle type conditionally rendered */}
          {puzzle.type === "pin-tumbler" && (
            <PinTumbler
              pinCount={parsedCode.length}
              solutionCode={parsedCode}
              onSubmit={handleAttempt}
              onReset={() => {
                setMessage("");
                setUnlocked(false);
                setAttempts(0);
                setElapsedSeconds(null);
                setTimerKey((k) => k + 1);
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
                setAttempts(0);
                setElapsedSeconds(null);
                setTimerKey((k) => k + 1);
              }}
            />
          )}

          {/* Timer (not displayed) Starts when puzzle loads, stops when `unlocked`*/}
          <Timer
            key={timerKey}
            running={!unlocked}
            onStop={(secs) => {
              // when timer stops because unlocked is true, submit score
              if (unlocked) submitScore(secs);
            }}
          />
          <OverlayMessage
            message={message}
            type={message?.startsWith("Unlocked!") ? "success" : "error"}
            successIcon={puzzle?.type === "dial" ? "🧶" : "🐟"}
            autoHide={true}
            duration={2500}
            onClose={() => setMessage("")}
          />
        </div>
      </div>
    </div>
  );
}
