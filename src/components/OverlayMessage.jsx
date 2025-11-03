import { useEffect } from "react";
import "../styles/OverlayMessage.css";

export default function OverlayMessage({
  message,
  type = "info", // 'success' | 'error' | 'info'
  autoHide = true,
  duration = 2500,
  onClose,
}) {
  useEffect(() => {
    if (!message) return;
    if (!autoHide) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, autoHide, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`overlay-message overlay-${type}`}
      role="status"
      aria-live="polite"
    >
      <div className="overlay-inner">
        <span className="overlay-emoji">
          {type === "success" ? "🔓" : type === "error" ? "❌" : "ℹ️"}
        </span>
        <span className="overlay-text">{message}</span>
      </div>
    </div>
  );
}
