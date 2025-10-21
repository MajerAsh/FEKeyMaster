import { useState } from "react";
import dialLockImg from "../assets/dial-lock.png";
import dialImg from "../assets/dial.png";

export default function DialLock({ solutionCode = [], onSubmit }) {
  const [currentValue, setCurrentValue] = useState(0);

  function increment() {
    setCurrentValue((prev) => (prev + 1) % 10);
  }

  function decrement() {
    setCurrentValue((prev) => (prev - 1 + 10) % 10);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit([currentValue]); // Wrap as array to match backend expectation
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4">Dial the Combination</h3>

      {/* Lock + Dial Container */}
      <div className="relative w-64 h-64 mb-6">
        {/* Lock face */}
        <img
          src={dialLockImg}
          alt="Dial Lock"
          className="absolute inset-0 w-full h-full object-contain z-0"
        />

        {/* Rotating dial */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <img
            src={dialImg}
            alt="Dial"
            className="w-28 h-28 object-contain"
            style={{
              transform: `rotate(${currentValue * 36}deg)`,
              transition: "transform 0.3s",
            }}
          />
          <div className="absolute text-4xl font-bold text-white pointer-events-none">
            {currentValue}
          </div>
        </div>
      </div>

      {/* Dial controls */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={increment}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ▲
        </button>
        <button
          onClick={decrement}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ▼
        </button>
      </div>

      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Unlock
      </button>
    </div>
  );
}
