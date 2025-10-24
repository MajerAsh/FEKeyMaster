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
import springs from "../assets/springs.png";

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

  // refs + responsive geometry:  component reads the image natural width/height at runtime
  // (via bodyRef.current.naturalWidth/naturalHeight) and falls back to 1332×552 if not available.
  const sceneRef = useRef(null);
  const bodyRef = useRef(null);
  // scale removed (not used directly) - kept computed in layout calculations
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

      // Use user's Procreate measurements (natural pixels)
      // Whole canvas: naturalW x naturalH (1330 x 552)
      // Shafts block: total area for 5 shafts + 4 gaps is 205 x 273
      // Positioned at natural X = 219 (space to the left of shafts = 219)
      const shaftsBlockLeft = 219;
      const shaftsBlockWidth = 205;

      // per-part natural sizes
      const shaftWidthNatural = 21.5; // approx 21-21.5px wide

      // vertical partition of shaft: upper (177) and lower (95)
      const upperPortionH = 177;
      const lowerPortionH = 95;

      // derive shafts block height from upper+lower
      const shaftsBlockHeight = upperPortionH + lowerPortionH;

      // compute gap between shafts (natural px)
      const gapsTotal = shaftsBlockWidth - pinCount * shaftWidthNatural;
      const gapNatural = gapsTotal / (pinCount - 1);

      // position shafts block vertically: according to your measurements there is ~20px above
      const shaftsBlockTop = 20;

      // map slider 0..120 to pixel travel: driver travel spans the lower portion of the shafts
      const travelNatural = lowerPortionH; // natural px travel for full driver movement
      setEffectiveTravel(travelNatural * newScale);

      const centers = [];
      for (let i = 0; i < pinCount; i++) {
        const cx =
          shaftsBlockLeft +
          shaftWidthNatural / 2 +
          i * (shaftWidthNatural + gapNatural);
        const cy = shaftsBlockTop + shaftsBlockHeight / 2; // center of shafts block
        centers.push({ x: cx, y: cy });
      }

      // each shaft (natural) is 22px by 272px
      const shaftInnerNatural = 272;
      const shearNaturalY = shaftsBlockTop + upperPortionH; // natural Y of shear line

      const newShafts = centers.map((c) => ({
        x: (c.x / naturalW) * renderedW,
        // top of the shaft box (rendered)
        top: (shaftsBlockTop / naturalH) * renderedH,
        innerLength: (shaftInnerNatural / naturalH) * renderedH,
        width: (shaftWidthNatural / naturalW) * renderedW,
        shearY: (shearNaturalY / naturalH) * renderedH,
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

      {/* Render order inside .lock-scene: lockBody (base) → full springs.png (full-layer) → per-shaft pin layers (drivers & keys) → shackleClosed (top). */}
      <div className="lock-scene" ref={sceneRef}>
        {/* Base lock body + springs (full-layer) */}
  <img src={lockBody} alt="Lock body" className="layer lock-body" ref={bodyRef} />
  <img src={springs} alt="springs" className="layer springs-full" />

        {/* 🎯 Dynamic pins - each pin-layer is anchored to a computed shaft box */}
        {pins.map((height, i) => {
          const target = parseInt(solutionCode[i]) || 0;
          const isSet = Math.abs(pins[i] - target) <= 2;

          // compute movement in px based on effectiveTravel
          let t = (height / 120) * effectiveTravel;
          t = Math.max(0, Math.min(t, effectiveTravel));

          // driver/key transforms driven directly by t

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
                src={isSet ? driverGreen : drivers[i]}
                alt={`driver ${i + 1}`}
                className="pin-img driver"
                style={{ transform: `translateY(${-t}px)` }}
              />

              <img
                src={keys[i]}
                alt={`key ${i + 1}`}
                className="pin-img key"
                style={{ transform: `translateY(${t * 0.6}px)` }}
              />
            </div>
          );
        })}
  {/* shackle should be on top of pins */}
  <img src={shackleClosed} alt="Shackle closed" className="layer shackle" />
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
