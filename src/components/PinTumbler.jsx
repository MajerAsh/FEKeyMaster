//react component
import { useState, useEffect } from "react";
import "../styles/PinTumbler.css";

export default function PinTumbler({
  pinCount = 5,
  solutionCode = [],
  onSubmit,
}) {
  const [pins, setPins] = useState(Array(pinCount).fill(0));
  const [setPinsStatus, setSetPinsStatus] = useState(
    Array(pinCount).fill(false)
  );

  // Reset pins if puzzle changes
  useEffect(() => {
    setPins(Array(pinCount).fill(0));
    setSetPinsStatus(Array(pinCount).fill(false));
  }, [pinCount]);

  function handleChange(index, value) {
    const height = parseInt(value);
    const newPins = [...pins];
    const newStatus = [...setPinsStatus];

    newPins[index] = height;

    // Parse solution value as integer for comparison
    const target = parseInt(solutionCode[index]);
    if (!isNaN(target) && Math.abs(height - target) <= 2) {
      newStatus[index] = true;
    } else {
      newStatus[index] = false;
    }
    console.log(
      `Pin ${index + 1} | Height: ${height} | Target: ${target} | Set: ${
        newStatus[index]
      }`
    );
    setPins(newPins);
    setSetPinsStatus(newStatus);
  }
  function handleReset() {
    setPins(Array(pinCount).fill(0));
    setSetPinsStatus(Array(pinCount).fill(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(pins);
  }

  return (
    <div className="lock-container">
      <h3>Pick the Lock</h3>

      <div className="pin-row">
        {pins.map((height, i) => (
          <div className="pin-slot" key={i}>
            <div className="pin" style={{ height: `${height}px` }} />
            <input
              type="range"
              min="0"
              max="120"
              value={height}
              onChange={(e) => handleChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* --- SVG lock illustration --- */}
      <svg
        width="300"
        height="400"
        viewBox="0 0 300 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lock body */}
        <rect
          x="50"
          y="50"
          width="200"
          height="300"
          rx="20"
          fill="#ccc"
          stroke="#999"
          strokeWidth="4"
        />

        {/* Shear line */}
        <line
          x1="50"
          y1="180"
          x2="250"
          y2="180"
          stroke="#000"
          strokeWidth="2"
          strokeDasharray="4,2"
        />

        {/* Dynamic pins */}
        {pins.map((height, i) => {
          const x = 70 + i * 40;

          return (
            <g key={i}>
              {/* Pin Shaft background */}
              <rect
                x={x - 5}
                y="60"
                width="10"
                height="260"
                fill="#eee"
                stroke="#aaa"
                strokeWidth="1"
              />

              {/* Shear guide inside each shaft */}
              <rect x={x - 5} y="179" width="10" height="2" fill="#444" />

              {/* Bottom (key) pin */}
              <rect
                x={x - 5}
                y={180 - height}
                width="10"
                height={height}
                fill="#f4a261"
                style={{ transition: "all 0.2s ease" }}
              />

              {/* Top (driver) pin */}
              <rect
                x={x - 5}
                y="60"
                width="10"
                height={setPinsStatus[i] ? 60 : 120 - height}
                fill={setPinsStatus[i] ? "#2ecc71" : "#999"}
                style={{ transition: "all 0.2s ease" }}
              />

              {/* Spring */}
              <line
                x1={x}
                y1="50"
                x2={x}
                y2="60"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Pick tool */}
        <rect
          x="40"
          y="260"
          width="180"
          height="10"
          rx="5"
          fill="#444"
          transform="rotate(-10 40 260)"
        />
      </svg>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleSubmit}>Unlock</button>
        <button onClick={handleReset} style={{ marginLeft: "10px" }}>
          Reset Pins
        </button>
      </div>
    </div>
  );
}
