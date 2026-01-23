import { useEffect } from "react";
import "../styles/OverlayMessage.css";

export default function OverlayMessage({
  message,
  type = "info", // 'success' | 'error' | 'info' | 'assist' | 'hint'
  successIcon,
  autoHide,
  duration = 2500,
  onClose,
}) {
  // assist overlays until click
  const shouldAutoHide =
    type === "assist" ? false : autoHide === undefined ? true : !!autoHide;

  useEffect(() => {
    if (!message) return;
    if (!shouldAutoHide) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, shouldAutoHide, duration, onClose]);

  if (!message) return null;

  const icon =
    type === "success"
      ? successIcon || "🐟"
      : type === "error"
        ? "❌"
        : type === "hint"
          ? "💡"
          : type === "assist"
            ? "🛠️"
            : "ℹ️";

  return (
    <div
      className={`overlay-message overlay-${type}`}
      role="status"
      aria-live="polite"
    >
      <div className="overlay-inner">
        <span className="overlay-emoji">{icon}</span>
        <span className="overlay-text">{message}</span>
      </div>
    </div>
  );
}
