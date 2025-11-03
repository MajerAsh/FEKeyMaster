import { useState } from "react"; //React's useState hook to handle dynamic data (state) in this component
import "../styles/DialLock.css";

// Export the main React component for use in your app
export default function DialLock({ solutionCode = [], onSubmit }) {
  const dialRange = 40; // numbers 0–39

  // ---------- STATE VARIABLES ----------
  // "value" is the current number showing on the dial (starts at 0)
  const [value, setValue] = useState(0);
  //track of all numbers the user has confirmed so far
  const [attempt, setAttempt] = useState([]);
  // "step" tracks how many numbers the user has entered in the sequence
  const [step, setStep] = useState(0);
  // "message" stores feedback for the user, like “Number saved” or “Wrong code”
  const [message, setMessage] = useState("");

  // ---------- DIAL CONTROL HANDLERS ----------
  // This function moves the dial up or down when the user clicks the arrows
  const handleChange = (direction) => {
    setValue((prev) => (prev + direction + dialRange) % dialRange);
  };

  // ---------- NUMBER CONFIRMATION ----------
  // When the user presses "Confirm Number", we save the current value
  const handleConfirmNumber = () => {
    if (step < solutionCode.length) {
      const newAttempt = [...attempt, value];
      setAttempt(newAttempt);
      setStep(step + 1);
      setMessage(`Saved number ${value} (${step + 1}/${solutionCode.length})`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (attempt.length === solutionCode.length) {
      onSubmit(attempt);
      setMessage("Attempt submitted!");
    } else {
      setMessage("Enter all numbers first.");
    }
  };

  const handleReset = () => {
    setAttempt([]);
    setStep(0);
    setMessage("Reset. Start again.");
  };

  const rotationDegrees = value * 9; // 40 numbers * 9° each

  return (
    <div className="dial-lock-container">
      <h3 className="text-xl font-semibold mb-4">Dial the Combination</h3>

      <div className="lock-stack">
        <img
          src="/images/diallock.png"
          alt="Lock body"
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

      {message && <p className="dial-message">{message}</p>}
    </div>
  );
}
