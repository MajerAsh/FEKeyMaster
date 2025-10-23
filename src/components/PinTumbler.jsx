import { useState, useEffect } from "react";
import "../styles/PinTumbler.css";

// 🗝️ Base lock parts
import lockBody from "../assets/lockbody.png";
import shackleClosed from "../assets/shackleClosed.png";
//import shackleSpringClosed from "../assets/shackle-springClosed.png";

// 🧩 Pin components (drivers, key pins, springs)
import driver1 from "../assets/driver1.png";
import key1 from "../assets/key1.png";
//import spring1 from "../assets/Spring1.png";

import driver2 from "../assets/driver2.png";
import key2 from "../assets/key2.png";
//import spring2 from "../assets/Spring2.png";

import driver3 from "../assets/driver3.png";
import key3 from "../assets/key3.png";
//import spring3 from "../assets/Spring3.png";

import driver4 from "../assets/driver4.png";
import key4 from "../assets/key4.png";
//import spring4 from "../assets/Spring4.png";

import driver5 from "../assets/driver5.png";
import key5 from "../assets/key5.png";
//import spring5 from "../assets/Spring5.png";

export default function PinTumbler({
  pinCount = 5,
  solutionCode = [],
  onSubmit,
}) {
  const [pins, setPins] = useState(Array(pinCount).fill(0));
  const [setPinsStatus, setSetPinsStatus] = useState(
    Array(pinCount).fill(false)
  );

  // Reset pins when puzzle changes
  useEffect(() => {
    setPins(Array(pinCount).fill(0));
    setSetPinsStatus(Array(pinCount).fill(false));
  }, [pinCount]);

  function handleChange(index, value) {
    const height = parseInt(value);
    const newPins = [...pins];
    const newStatus = [...setPinsStatus];

    newPins[index] = height;

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

  // 🧩 Asset arrays for rendering
  //const springs = [spring1, spring2, spring3, spring4, spring5];
  const drivers = [driver1, driver2, driver3, driver4, driver5];
  const keys = [key1, key2, key3, key4, key5];

  return (
    <div className="lock-container">
      <h3>Pick the Lock</h3>

      <div className="lock-scene">
        {/* Base lock body + shackle */}
        <img src={lockBody} alt="Lock body" className="layer" />
        {/* <img src={shackleSpringClosed} alt="Shackle spring" className="layer" /> */}
        <img src={shackleClosed} alt="Shackle closed" className="layer" />

        {/* 🎯 Dynamic pins */}
        {pins.map((height, i) => {
          const target = parseInt(solutionCode[i]) || 0;
          const isSet = Math.abs(pins[i] - target) <= 2;

          // 🧮 Physics-ish calculations
          // const springCompression = Math.max(0.5, 1 - pins[i] / 180); // compress spring as pin pushed
          const driverOffset = isSet ? 0 : -pins[i] * 0.6; // driver stops at shear
          const keyOffset = isSet ? -(target * 0.4) : -pins[i] * 0.4; // key stops below

          return (
            <div key={i} className="pin-layer">
              {/* Spring 
              <img
                src={springs[i]}
                alt={`spring ${i + 1}`}
                className="layer spring"
                style={{
                  transform: `translateY(${driverOffset}px) scaleY(${springCompression})`,
                  transformOrigin: "top center",
                }}
              />*/}

              {/* Driver pin */}
              <img
                src={drivers[i]}
                alt={`driver ${i + 1}`}
                className="layer driver"
                style={{
                  transform: `translateY(${driverOffset}px)`,
                  filter: isSet ? "hue-rotate(90deg)" : "none", // visual cue for set pin
                }}
              />

              {/* Key pin */}
              <img
                src={keys[i]}
                alt={`key ${i + 1}`}
                className="layer key"
                style={{
                  transform: `translateY(${keyOffset}px)`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 🕹️ Sliders */}
      <div className="pin-controls">
        {pins.map((height, i) => (
          <input
            key={i}
            type="range"
            min="0"
            max="120"
            value={height}
            onChange={(e) => handleChange(i, e.target.value)}
          />
        ))}
      </div>

      {/* 🔘 Buttons */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleSubmit}>Unlock</button>
        <button onClick={handleReset} style={{ marginLeft: "10px" }}>
          Reset Pins
        </button>
      </div>
    </div>
  );
}
