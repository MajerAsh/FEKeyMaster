//react component
import { useState } from "react";
import "../styles/PinTumbler.css";

export default function PinTumbler({ pinCount = 5, onSubmit }) {
  const [pins, setPins] = useState(Array(pinCount).fill(0));

  function handleChange(index, value) {
    const newPins = [...pins];
    newPins[index] = parseInt(value);
    setPins(newPins);
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
              max="100"
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
        {/* Lock casing */}
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
          stroke="#444"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Dynamic pins */}
        {pins.map((height, i) => {
          const x = 70 + i * 40;
          return (
            <g key={i}>
              {/* Shaft */}
              <rect
                x={x - 5}
                y="60"
                width="10"
                height="260"
                fill="#eee"
                stroke="#aaa"
                strokeWidth="1"
              />
              {/* Top pin */}
              <rect x={x - 5} y="60" width="10" height="60" fill="#999" />
              {/* Bottom pin – moves with slider */}
              <rect
                x={x - 5}
                y={180 - height} // vertical position
                width="10"
                height={height} // height of pin
                fill="#f4a261"
                style={{ transition: "all 0.15s ease" }}
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

      <button onClick={handleSubmit}>Unlock</button>
    </div>
  );
}
