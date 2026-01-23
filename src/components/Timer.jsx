import { useEffect, useRef, useState } from "react";

/* Props:
- running (bool) : when true timer runs, when false it stops and calls onStop
- onStop(elapsedSeconds) : called once when timer stops (with integer seconds)*/
export default function Timer({ running = true, onStop, intervalMs = 200 }) {
  const startRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (running) {
      //start
      if (!startRef.current) startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs((Date.now() - startRef.current) | 0);
      }, intervalMs);
      return () => clearInterval(timerRef.current);
    } else {
      //stop
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (startRef.current != null) {
        const totalMs = Date.now() - startRef.current;
        const secs = Math.max(0, Math.round(totalMs / 1000));
        if (typeof onStop === "function") onStop(secs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // text for debugging but invisible by default.
  return (
    <div style={{ display: "none" }} aria-hidden>
      {Math.max(0, Math.round(elapsedMs / 1000))}
    </div>
  );
}
