import { useState } from "react";

export default function DialLock({ solutionCode = [], onSubmit }) {
  const [value, setValue] = useState(0); // One dial value (0-39)

  function handleChange(direction) {
    setValue((prev) => (prev + direction + 40) % 40); // Wrap around 0-39
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit([value]);
  }

  // Each tick = 9 degrees (360° / 40 numbers)
  const rotationDegrees = value * 9;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4">Dial the Combination</h3>

      <div className="relative w-[368px] h-[734px]">
        {/* Lock background */}
        <img
          src="/images/diallock.png"
          alt="Dial Lock"
          className="absolute top-0 left-0 w-full h-full z-0"
        />

        {/* Rotating dial */}
        <img
          src="/images/dial.png"
          alt="Rotating Dial"
          className="absolute z-10 left-1/2"
          style={{
            width: "165px",
            height: "165px",
            bottom: "40px",
            transform: `translateX(-50%) rotate(${rotationDegrees}deg)`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => handleChange(1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ▲
        </button>
        <button
          onClick={() => handleChange(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ▼
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Unlock
      </button>
    </div>
  );
}
