import { useState, useEffect, useRef } from "react";
import "../styles/PinTumbler.css";

// 🗝️ Base lock parts
import lockBody from "../assets/lockbody.png";
import shackleClosed from "../assets/shackleClosed.png";
//import shackleSpringClosed from "../assets/shackle-springClosed.png";

// 🧩 Pin components (drivers, key pins, springs)
import driver from "../assets/driver.png";
import driverGreen from "../assets/driverGreen.png";
import key from "../assets/key.png";
import spring from "../assets/spring.png";

export default function PinTumbler({
  pinCount = 5,
  solutionCode = [],
  onSubmit,
  showGuides = true, //to toggle the tuning overlay/ grid
  alignToGrid = true,
  gridSize = 5,
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

  // refs + responsive geometry
  const sceneRef = useRef(null);
  const bodyRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [effectiveTravel, setEffectiveTravel] = useState(120);
  const [shafts, setShafts] = useState([]);

  // one shared asset per part (repeat per pin)
  const drivers = Array(pinCount).fill(driver);
  const keys = Array(pinCount).fill(key);

  // compute responsive shafts and scale
  useEffect(() => {
    const update = () => {
      const body = bodyRef.current;
      const scene = sceneRef.current;
      if (!body || !scene) return;
      let renderedW = body.clientWidth || body.getBoundingClientRect().width;
      let renderedH = body.clientHeight || body.getBoundingClientRect().height;

      const naturalW = body.naturalWidth || 1332;
      const naturalH = body.naturalHeight || 552;

      // Optionally snap rendered dimensions so they align to a grid (e.g. 5px)
      if (alignToGrid && scene) {
        const availableW = scene.clientWidth || renderedW;
        const snappedW = Math.max(
          gridSize,
          Math.round(availableW / gridSize) * gridSize
        );
        const snappedH = Math.round((snappedW / naturalW) * naturalH);
        // Apply snapped pixel-perfect size to the body image to keep coordinate math integer-aligned
        body.style.width = `${snappedW}px`;
        body.style.height = `${snappedH}px`;
        renderedW = snappedW;
        renderedH = snappedH;
      }

      // choose scale based on width to keep horizontal placement stable
      const newScale = renderedW / naturalW;
      setScale(newScale);

      // map slider 0..120 to pixel travel (natural estimate)
      const travelNatural = 200; // natural px travel for full range; tune if needed
      setEffectiveTravel(travelNatural * newScale);

      // Use provided natural coordinates (5px grid)
      // X range for all shafts: 53..109 (natural px)
      const xMin = 53;
      const xMax = 109;

      // Y midpoints for shafts 1..5 (natural px)
      // shaft1 midpoint from earlier: (45+49.5)/2 = 47.25
      const shaftYs = [
        47.25,
        (55 + 59) / 2,
        (64 + 68) / 2,
        (82 + 87) / 2,
        (92 + 96) / 2,
      ];

      // shear line natural X (provided)
      const shearLineX = 73;

      const centers = [];
      for (let i = 0; i < pinCount; i++) {
        const t = pinCount === 1 ? 0.5 : i / (pinCount - 1);
        const cx = xMin + t * (xMax - xMin);
        const cy =
          shaftYs[i] !== undefined ? shaftYs[i] : shaftYs[shaftYs.length - 1];
        centers.push({ x: cx, y: cy });
      }

      const springNaturalH = 121;
      const driverNaturalH = 93;
      const keyNaturalH = 76;
      const shaftInnerNatural =
        springNaturalH + driverNaturalH + keyNaturalH + 20; // padding
      const shaftWidthNatural = 23;

      const newShafts = centers.map((c) => ({
        x: (c.x / naturalW) * renderedW,
        top: (c.y / naturalH) * renderedH,
        innerLength: (shaftInnerNatural / naturalH) * renderedH,
        width: (shaftWidthNatural / naturalW) * renderedW,
        shearX: (shearLineX / naturalW) * renderedW,
      }));

      setShafts(newShafts);
    };

    update();
    const ro = new ResizeObserver(update);
    if (bodyRef.current) ro.observe(bodyRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pinCount, alignToGrid, gridSize]);

  return (
    <div className="lock-container">
      <h3>Pick the Lock</h3>

      <div className="lock-scene" ref={sceneRef}>
        {/* Base lock body + shackle */}
        <img src={lockBody} alt="Lock body" className="layer" ref={bodyRef} />
        <img src={shackleClosed} alt="Shackle closed" className="layer" />

        {/* 🎯 Dynamic pins - each pin-layer is anchored to a computed shaft box */}
        {pins.map((height, i) => {
          const target = parseInt(solutionCode[i]) || 0;
          const isSet = Math.abs(pins[i] - target) <= 2;

          // compute movement in px based on effectiveTravel
          let t = (height / 120) * effectiveTravel;
          t = Math.max(0, Math.min(t, effectiveTravel));

          const springNaturalH = 121;
          const springCompress = Math.max(
            0.35,
            1 - t / (springNaturalH * scale)
          );
          const springTranslate = -t * 0.5;
          const driverTranslate = -t * 0.6;
          const keyTranslate = -t * 0.4;

          const shaft = shafts[i] || {
            x: 80,
            top: 40,
            innerLength: 200,
            width: 24,
            shearX: 73,
          };

          const pinLayerStyle = {
            left: `${shaft.x - shaft.width / 2}px`,
            top: `${shaft.top}px`,
            width: `${shaft.width}px`,
            height: `${shaft.innerLength}px`,
          };

          return (
            <div key={i} className="pin-layer" style={pinLayerStyle}>
              {showGuides && (
                <div
                  className="shaft-guide"
                  style={{ width: "100%", height: "100%" }}
                />
              )}

              <img
                src={spring}
                alt={`spring ${i + 1}`}
                className="pin-img spring"
                style={{
                  transform: `translateY(${springTranslate}px) scaleY(${springCompress})`,
                  transformOrigin: "top center",
                }}
              />

              <img
                src={isSet ? driverGreen : drivers[i]}
                alt={`driver ${i + 1}`}
                className="pin-img driver"
                style={{ transform: `translateY(${driverTranslate}px)` }}
              />

              <img
                src={keys[i]}
                alt={`key ${i + 1}`}
                className="pin-img key"
                style={{ transform: `translateY(${keyTranslate}px)` }}
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
