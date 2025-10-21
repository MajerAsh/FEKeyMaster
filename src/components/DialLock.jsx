import { useState } from "react";
import "../styles/DialLock.css"; // Import the CSS

export default function DialLock({ solution_code = [], onSubmit }) {
  const [value, setValue] = useState(0);

  const handleChange = (direction) => {
    setValue((prev) => (prev + direction + 40) % 40);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit([value]);
  };

  const rotationDegrees = value * 9; // Each tick is 9 degrees

  return (
    <div className="dial-lock-container">
      <h3 className="text-xl font-semibold mb-4">Dial the Combination</h3>

      <div className="lock-stack">
        <img
          src="/images/diallock.png"
          alt="Dial Lock"
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
        <button onClick={() => handleChange(-1)} className="dial-button">
          ▼
        </button>
      </div>

      <button onClick={handleSubmit} className="unlock-button">
        Unlock
      </button>
    </div>
  );
}
