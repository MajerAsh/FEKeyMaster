import { useState } from "react";

export default function DialLock({
  dialCount = 3,
  solutionCode = [],
  onSubmit,
}) {
  const [values, setValues] = useState(Array(dialCount).fill(0));

  function handleChange(i, direction) {
    setValues((prev) => {
      const updated = [...prev];
      updated[i] = (updated[i] + direction + 10) % 10;
      return updated;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-4">Dial the Combination</h3>
      <div className="flex gap-6">
        {values.map((v, i) => (
          <div
            key={i}
            className="w-16 h-24 relative flex flex-col items-center justify-center"
          >
            <div className="w-full h-full bg-gray-100 border-2 border-gray-400 rounded-lg flex flex-col items-center justify-center relative">
              <div className="text-3xl font-mono transform rotate-0">{v}</div>
            </div>
            <div className="absolute -top-6 flex gap-2">
              <button
                onClick={() => handleChange(i, 1)}
                className="w-6 h-6 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600"
              >
                ▲
              </button>
              <button
                onClick={() => handleChange(i, -1)}
                className="w-6 h-6 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Unlock
      </button>
    </div>
  );
}
