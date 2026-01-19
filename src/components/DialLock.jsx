import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/DialLock.css";
import OverlayMessage from "./OverlayMessage"; // adjust path if needed

const DIAL_RANGE = 40;
const DEGREES_PER_TICK = 360 / DIAL_RANGE; // 9
const STEP2_REQUIRED_CLICKS = 3;

const norm = (n) => ((n % DIAL_RANGE) + DIAL_RANGE) % DIAL_RANGE;

function safeInt(n, fallback = 0) {
  const v = Number.parseInt(n, 10);
  return Number.isFinite(v) ? v : fallback;
}

export default function DialLock({
  solutionCode = [],
  onSubmit,
  unlocked = false,
  onReset,
}) {
  const comboLength = solutionCode.length || 3;

  const [value, setValue] = useState(0);
  const [attempt, setAttempt] = useState([]);
  const [step, setStep] = useState(0);
  const [angle, setAngle] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);

  const [overlay, setOverlay] = useState({ message: "", type: "info" });
  const closeOverlay = () => setOverlay({ message: "", type: "info" });
  const showOverlay = (message, type = "info") => setOverlay({ message, type });

  // Step-2 mechanics
  const step2FullRotationRef = useRef(false);
  const step2CcwCountRef = useRef(0);
  const step2StiffPosRef = useRef(null);
  const step2StiffCountRef = useRef(0);

  // Assist flags (useRef so we don't trigger re-renders)
  const step1AssistShownRef = useRef(false);
  const step3AssistShownRef = useRef(false);

  // Audio
  const clickAudio = useRef(null);
  const subClickAudio = useRef(null);
  const lockOpenAudio = useRef(null);

  useEffect(() => {
    clickAudio.current = new Audio("/sounds/click.wav");
    subClickAudio.current = new Audio("/sounds/subClick.wav");
    lockOpenAudio.current = new Audio("/sounds/lockopen.wav");
  }, []);

  function playSound(ref) {
    try {
      const snd = ref.current?.cloneNode();
      if (snd) void snd.play();
    } catch {
      // ignore audio errors (autoplay restrictions, missing file)
    }
  }

  // Assist text: show once at start, and once when entering step 3
  useEffect(() => {
    if (!step1AssistShownRef.current) {
      showOverlay(
        "Turn counter-clockwise and listen for a click — then add 5. That’s the first number.",
        "assist"
      );
      step1AssistShownRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (step === 2 && !step3AssistShownRef.current) {
      showOverlay(
        "Turn clockwise — when you hear a louder click, that's the number.",
        "assist"
      );
      step3AssistShownRef.current = true;
    }
  }, [step]);

  // Close overlays when the user interacts anywhere
  useEffect(() => {
    if (!overlay.message) return;
    const onDocPointer = () => closeOverlay();
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [overlay.message]);

  // Play lock sound when unlocked
  useEffect(() => {
    if (unlocked) playSound(lockOpenAudio);
  }, [unlocked]);

  const targets = useMemo(() => {
    return [
      safeInt(solutionCode[0], 0),
      safeInt(solutionCode[1], 0),
      safeInt(solutionCode[2], 0),
    ];
  }, [solutionCode]);

  function applyTurn(direction, newValue) {
    setValue(newValue);
    setAngle((a) => a - direction * DEGREES_PER_TICK);
  }

  function handleStep1Turn(direction, newValue) {
    const target = targets[0];
    const clickPos = norm(target - 5);

    if (direction === 1 && newValue === clickPos) playSound(clickAudio);
    applyTurn(direction, newValue);
  }

  function handleStep2Turn(direction, newValue) {
    const target = targets[1];

    // Require a full CCW rotation before stiff-zone behavior applies
    if (!step2FullRotationRef.current) {
      if (direction === -1) {
        step2CcwCountRef.current += 1;
        if (step2CcwCountRef.current >= DIAL_RANGE)
          step2FullRotationRef.current = true;
      }
      applyTurn(direction, newValue);
      return;
    }

    // Clockwise allowed, but it resets stiff-zone counters
    if (direction === 1) {
      step2StiffPosRef.current = null;
      step2StiffCountRef.current = 0;
      applyTurn(direction, newValue);
      return;
    }

    // CCW stiff zone: last 5 numbers before target
    const distToTargetCCW = (newValue - target + DIAL_RANGE) % DIAL_RANGE;
    if (distToTargetCCW > 0 && distToTargetCCW <= 5) {
      const pos = newValue;

      if (step2StiffPosRef.current !== pos) {
        step2StiffPosRef.current = pos;
        step2StiffCountRef.current = 1;
        return;
      }

      step2StiffCountRef.current += 1;
      if (step2StiffCountRef.current < STEP2_REQUIRED_CLICKS) return;

      step2StiffPosRef.current = null;
      step2StiffCountRef.current = 0;
    }

    // Prevent moving past the target CCW
    if (newValue === norm(target - 1)) return;

    applyTurn(direction, newValue);
  }

  function handleStep3Turn(direction, newValue) {
    // Step 3 requires clockwise movement
    if (direction !== 1) {
      showOverlay("Turn clockwise to find the third number.", "hint");
      return;
    }

    applyTurn(direction, newValue);

    const target = targets[2];
    if (newValue === target) playSound(clickAudio);
    else playSound(subClickAudio);
  }

  function handleChange(direction) {
    setLastDirection(direction);

    const newValue = norm(value + direction);

    if (step === 0) return handleStep1Turn(direction, newValue);
    if (step === 1) return handleStep2Turn(direction, newValue);
    if (step === 2) return handleStep3Turn(direction, newValue);

    // Beyond expected steps: allow turning but no extra logic
    applyTurn(direction, newValue);
  }

  function handleConfirmNumber() {
    if (step >= comboLength) {
      // showOverlay("All numbers already entered.", "info");
      return;
    }

    const current = value;
    const dir = lastDirection ?? 0;

    if (step === 0) {
      if (dir !== 1)
        return showOverlay("Turn clockwise to find the first number.", "hint");
      const clickPos = norm(targets[0] - 5);
      const correctNumber = norm(clickPos + 5);

      if (current === clickPos) {
        playSound(subClickAudio);
        showOverlay(
          "Add 5 to the click position — that’s the first number.",
          "info"
        );
      }
      if (current === correctNumber) playSound(clickAudio);

      // entering step 2: reset rotation tracking
      step2CcwCountRef.current = 0;
      step2FullRotationRef.current = false;
      showOverlay(
        "Second number: turn counter-clockwise one full rotation, then feel for resistance.",
        "assist"
      );
    }

    if (step === 1) {
      if (dir !== -1)
        return showOverlay(
          "Turn counter-clockwise to confirm the second number.",
          "hint"
        );
      if (current === targets[1]) playSound(clickAudio);
    }

    if (step === 2) {
      if (dir !== 1)
        return showOverlay(
          "Turn clockwise to confirm the third number.",
          "hint"
        );
      if (current === targets[2]) playSound(clickAudio);
      else showOverlay("Listen for a different click.", "info");
    }

    setAttempt((prev) => [...prev, current]);
    setStep((s) => s + 1);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (attempt.length !== comboLength) {
      showOverlay("Enter all numbers first.", "info");
      return;
    }

    onSubmit?.(attempt);

    const correct =
      JSON.stringify(attempt) ===
      JSON.stringify(solutionCode.slice(0, comboLength));

    showOverlay(
      correct ? "Unlocked!" : "Incorrect combination.",
      correct ? "success" : "error"
    );
  }

  function handleReset() {
    setAttempt([]);
    setStep(0);
    setValue(0);
    setAngle(0);
    setLastDirection(null);

    step2FullRotationRef.current = false;
    step2CcwCountRef.current = 0;
    step2StiffPosRef.current = null;
    step2StiffCountRef.current = 0;

    step1AssistShownRef.current = false;
    step3AssistShownRef.current = false;

    closeOverlay();
    // showOverlay("Reset. Start again.", "info");
    onReset?.();
  }

  return (
    <div className="dial-lock-container">
      <div className="lock-stack">
        <img
          src={unlocked ? "/images/diallockopened.png" : "/images/diallock.png"}
          alt={unlocked ? "Lock opened" : "Lock body"}
          className="lock-image"
        />
        <img
          src="/images/dial.png"
          alt="Dial"
          className="dial-image"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </div>

      <div className="dial-controls">
        <button
          type="button"
          onClick={() => handleChange(1)}
          className="dial-button"
        >
          ▲
        </button>
        <span className="dial-number">{value}</span>
        <button
          type="button"
          onClick={() => handleChange(-1)}
          className="dial-button"
        >
          ▼
        </button>
      </div>

      <div className="attempt-display">
        <p>Selected: {attempt.join(" - ") || "None yet"}</p>
      </div>

      <div className="dial-actions-grid">
        <button
          type="button"
          onClick={handleConfirmNumber}
          className="confirm-button"
        >
          Select Number
        </button>

        <button type="button" onClick={handleReset} className="reset-button">
          Reset
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="unlock-button"
          disabled={attempt.length < comboLength}
        >
          Unlock
        </button>
      </div>

      {overlay.message && (
        <OverlayMessage
          message={overlay.message}
          type={overlay.type}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}
