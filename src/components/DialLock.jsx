import { useState, useEffect, useRef } from "react"; //React's useState hook to handle dynamic data (state) in this component
import OverlayMessage from "./OverlayMessage";
import "../styles/DialLock.css";

// Export the main React component for use in your app
export default function DialLock({
  solutionCode = [],
  onSubmit,
  unlocked = false,
  onReset,
}) {
  const dialRange = 40; // numbers 0–39

  // ---------- STATE VARIABLES ----------
  // "value" is the current number showing on the dial (starts at 0)
  const [value, setValue] = useState(0);
  //track of all numbers the user has confirmed so far
  const [attempt, setAttempt] = useState([]);
  // "step" tracks how many numbers the user has entered in the sequence
  const [step, setStep] = useState(0);
  const [overlay, setOverlay] = useState({ message: "", type: "info" }); //Set overlay?
  // "message" stores feedback for the user, like “Number saved” or “Wrong code”
  //const [message, setMessage] = useState("");
  const [lastDirection, setLastDirection] = useState(null);
  const [, setTurnCount] = useState(0);
  const [step2CcwCount, setStep2CcwCount] = useState(0);
  const [step2FullRotation, setStep2FullRotation] = useState(false);
  // angle tracks accumulated rotation in degrees to avoid large wrap jumps
  const [angle, setAngle] = useState(0);
  // refs for per-digit stiff-zone counting (step 2)
  const step2StiffPosRef = useRef(null);
  const step2StiffCountRef = useRef(0);
  const STEP2_REQUIRED_CLICKS = 3; // require 3 presses per number in stiff zone

  //Audio Refs
  const clickAudio = useRef(null);
  const subClickAudio = useRef(null);
  const lockOpenAudio = useRef(null);

  useEffect(() => {
    clickAudio.current = new Audio("/sounds/click.wav");
    subClickAudio.current = new Audio("/sounds/subClick.wav");
    lockOpenAudio.current = new Audio("/sounds/lockopen.wav");
  }, []);

  // helper to show overlay popup
  function showOverlay(msg, type = "info") {
    setOverlay({ message: msg, type });
  }

  // play sound safely
  function playSound(ref) {
    try {
      const snd = ref.current.cloneNode();
      void snd.play();
    } catch {
      /* ignore load errors */
    }
  }

  // normalize value into 0..dialRange-1
  const norm = (n) => ((n % dialRange) + dialRange) % dialRange;

  //--------------COMBO LOCK PICK LOGIC (WikiHow)---------------------------------
  /*HANDLE ROTATION:
  ---------------------------------------*/
  function handleChange(direction) {
    setLastDirection(direction);
    setTurnCount((c) => c + 1);

    const newValue = norm(value + direction);

    // STEP 3 constraint: require clockwise movement for step 3 and beyond
    if (step >= 2 && direction !== 1) {
      // Block counter-clockwise moves during step 3 and show a hint
      showOverlay(
        "Only move clockwise to get the correct third number.",
        "hint"
      );
      return;
    }

    // STEP 1: Clockwise-only click detection (user hears click 5 before answer)
    if (step === 0) {
      const target = parseInt(solutionCode[0]) || 0;
      const clickPos = norm(target - 5);

      // Only play the click when moving clockwise into the click position
      if (direction === 1 && newValue === clickPos) {
        playSound(clickAudio);
      }

      // update display value and accumulated angle (avoid large CSS wrap jumps)
      setValue(newValue);
      setAngle((a) => a - direction * 9);
      return;
    }

    // STEP 2: Counter-clockwise with a "stiff" zone 5 before the target
    if (step === 1) {
      const target = parseInt(solutionCode[1]) || 0;

      // If the user hasn't completed the required full CCW rotation yet,
      // encourage them to do so and track CCW presses. We don't enforce the
      // "stiff" region until they've done the full rotation.
      if (!step2FullRotation) {
        if (direction === -1) {
          setStep2CcwCount((c) => {
            const next = c + 1;
            if (next >= dialRange) setStep2FullRotation(true);
            return next;
          });
        }

        // allow visual movement regardless of direction while they complete the
        // required full CCW rotation
        setValue(newValue);
        setAngle((a) => a - direction * 9);
        return;
      }

      // After the full rotation is complete, apply the stiff-zone rules.
      // If user turns clockwise during this step, allow visual movement but
      // confirmation will prompt a hint (we check on confirm)
      if (direction === 1) {
        setValue(newValue);
        setAngle((a) => a - direction * 9);
        // reset stiff counters when user moves clockwise out of the area
        step2StiffPosRef.current = null;
        step2StiffCountRef.current = 0;
        return;
      }

      // Moving counter-clockwise: implement a per-digit "stiff" region where
      // multiple presses are required to advance one visible step.
      // Determine CCW distance from newValue to target (0 means at target)
      const distToTargetCCW = (newValue - target + dialRange) % dialRange;
      if (distToTargetCCW > 0 && distToTargetCCW <= 5) {
        // inside stiff zone: require multiple presses for each digit
        const pos = newValue;
        if (step2StiffPosRef.current !== pos) {
          // starting to press into a new digit: set count=1 and do not move yet
          step2StiffPosRef.current = pos;
          step2StiffCountRef.current = 1;
          return;
        } else {
          // same digit being pressed repeatedly
          step2StiffCountRef.current += 1;
          if (step2StiffCountRef.current < STEP2_REQUIRED_CLICKS) {
            return; // require more presses
          }
          // enough presses: allow the move and reset counters
          step2StiffPosRef.current = null;
          step2StiffCountRef.current = 0;
        }
      }

      // Prevent moving beyond the correct number when turning CCW
      if (newValue === norm(target - 1)) return;

      setValue(newValue);
      setAngle((a) => a - direction * 9);
      return;
    }

    // STEP 3+ (and default behavior): for step 2 (index 2) we play subClick on
    // normal moves and click when landing on the target; allow movement both ways
    setValue(newValue);
    setAngle((a) => a - direction * 9);
    if (step === 2) {
      const target = parseInt(solutionCode[2]) || 0;
      if (newValue === target) playSound(clickAudio);
      else playSound(subClickAudio);
    }
    return;
  }

  /*CONFIRM CURRENT NUMBER 
  --------------------------------------------*/
  function handleConfirmNumber() {
    const current = value;
    const dir = lastDirection || 0;

    // Prevent confirming more numbers than the lock expects
    if (step >= solutionCode.length) {
      showOverlay("All numbers already entered.", "info");
      return;
    }

    // STEP 1: must have been turning clockwise to legitimately read the click
    if (step === 0) {
      const target = parseInt(solutionCode[0]) || 0;
      const clickPos = norm(target - 5);
      const correctNumber = norm(clickPos + 5);

      if (dir !== 1) {
        showOverlay(
          "Only move clockwise to get the correct first number.",
          "hint"
        );
        return;
      }

      if (current === clickPos) {
        playSound(subClickAudio);
        showOverlay(
          "Add 5 to where you heard the click — that’s your correct number.",
          "info"
        );
        // allow recording the click position if the user confirms it
      }

      if (current === correctNumber) {
        playSound(clickAudio);
      }
    }

    // STEP 2: must be turning counter-clockwise to confirm
    else if (step === 1) {
      const target = parseInt(solutionCode[1]) || 0;
      if (dir !== -1) {
        showOverlay(
          "Only move counter clockwise to get the correct second number.",
          "hint"
        );
        return;
      }

      if (current === target) playSound(clickAudio);
    }

    // STEP 3 (index 2): must be clockwise; provide hints when incorrect
    else if (step === 2) {
      const target = parseInt(solutionCode[2]) || 0;
      if (dir !== 1) {
        showOverlay(
          "Only move clockwise to get the correct third number.",
          "hint"
        );
        return;
      }

      if (current === target) playSound(clickAudio);
      else showOverlay("Listen for the loudest click.", "info");
    }

    // record the answered number and advance
    const newAttempt = [...attempt, current];
    setAttempt(newAttempt);

    // If we're moving into STEP 2, reset the step2 rotation trackers and show guidance
    if (step === 0) {
      setStep2CcwCount(0);
      setStep2FullRotation(false);
      showOverlay(
        "Turn the lock counter clockwise one full rotation, then proceed to find the second number.",
        "assist"
      );
    }

    setStep(step + 1);
  }

  // SUBMIT ATTEMPT (unlock) ----------
  function handleSubmit(e) {
    e.preventDefault();
    if (attempt.length === solutionCode.length) {
      onSubmit(attempt);
      const correct = JSON.stringify(attempt) === JSON.stringify(solutionCode);
      if (correct) showOverlay("Unlocked!", "success");
      else showOverlay("Incorrect combination.", "error");
    } else {
      showOverlay("Enter all numbers first.", "info");
    }
  }

  // Play lock open sound when parent sets unlocked
  useEffect(() => {
    if (!unlocked) return;
    try {
      const audio = lockOpenAudio.current;
      if (audio) {
        const snd = audio.cloneNode();
        void snd.play();
      }
    } catch {
      /* ignore */
    }
  }, [unlocked]);
  // RESET
  // ---------------------------------------
  function handleReset() {
    setAttempt([]);
    setStep(0);
    setValue(0);
    setAngle(0);
    setTurnCount(0);
    // clear step2 trackers
    setStep2CcwCount(0);
    setStep2FullRotation(false);
    step2StiffPosRef.current = null;
    step2StiffCountRef.current = 0;
    showOverlay("Reset. Start again.", "info");
    if (typeof onReset === "function") onReset();
  }
  // Each number represents 9° of rotation (360° / 40 numbers = 9°)
  // Use accumulated `angle` to avoid large wrap-around jumps when crossing 0
  const rotationDegrees = angle;

  // ---------- RETURN  -------------------------------------------
  return (
    <div className="dial-lock-container">
      <h3 className="text-xl font-semibold mb-4">Dial the Combination</h3>

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
          style={{ transform: `rotate(${rotationDegrees}deg)` }}
        />
      </div>

      <div className="dial-controls">
        <button onClick={() => handleChange(1)} className="dial-button">
          ▲
        </button>
        <span className="dial-number">{value}</span>
        <button onClick={() => handleChange(-1)} className="dial-button">
          ▼
        </button>
      </div>

      <div className="dial-actions">
        <button onClick={handleConfirmNumber} className="confirm-button">
          Confirm Number
        </button>
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>

      <div className="attempt-display">
        <p>Attempt: {attempt.join(" - ") || "None yet"}</p>
      </div>

      <button
        onClick={handleSubmit}
        className="unlock-button"
        disabled={attempt.length < solutionCode.length}
      >
        Unlock
      </button>

      {overlay.message && (
        <OverlayMessage
          message={overlay.message}
          type={overlay.type}
          onClose={() => setOverlay({ message: "", type: "info" })}
        />
      )}
    </div>
  );
}
