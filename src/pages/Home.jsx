import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import "../styles/Home.css";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const wrapperRef = useRef(null);
  const spriteRef = useRef(null);
  const imgRef = useRef(null);

  // Cat center (from Procreate measurements)
  const CAT_CENTER_X = 0.3059; // 30.59% from left
  const CAT_CENTER_Y = 0.854; // 85.40% from top

  /* Position the sprite in px inside the procreate img wrapper so it remains
  locked to the image as it scales. 
used a ResizeObserver so the
 sprite updates whenever the artwork box changes size.*/
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const sprite = spriteRef.current;
    const img = imgRef.current;
    if (!wrapper || !sprite || !img) return;

    const FRAME_COUNT = 15;
    const FRAME_NATIVE_W = 144; // each frame natural width in px
    const FRAME_NATIVE_H = 145; // " " natural height in px

    const TOTAL_ANIMATION_MS = 1500;
    const FRAME_DURATION_MS = TOTAL_ANIMATION_MS / FRAME_COUNT;

    let frameIndex = 0;
    let intervalId = null;
    const PAUSE_BETWEEN_LOOPS_MS = 3000;

    function update() {
      const wrapperW = wrapper.clientWidth;
      const wrapperH = wrapper.clientHeight;
      const natW = img.naturalWidth || 1693;
      const natH = img.naturalHeight || 1667;
      const scale = Math.min(wrapperW / natW, wrapperH / natH);
      const dispW = natW * scale;
      const dispH = natH * scale;
      const offsetX = (wrapperW - dispW) / 2;
      const offsetY = (wrapperH - dispH) / 2;

      // Compute desired sprite size based on cat box ratio, cap at native
      const CAT_BOX_RATIO = 364 / 1693; // cat box width relative to artwork
      let spriteW = Math.round(dispW * CAT_BOX_RATIO);
      const spriteH = Math.round((FRAME_NATIVE_H / FRAME_NATIVE_W) * spriteW);
      // cap sprite width to native frame width to avoid upscaling blur
      if (spriteW > FRAME_NATIVE_W) spriteW = FRAME_NATIVE_W;

      const leftPx = Math.round(offsetX + dispW * CAT_CENTER_X);
      const topPx = Math.round(offsetY + dispH * CAT_CENTER_Y);

      // apply sizing and position in px so placement is pixel-perfect
      sprite.style.width = spriteW + "px";
      sprite.style.height = spriteH + "px";
      sprite.style.left = leftPx + "px";
      sprite.style.top = topPx + "px";
      sprite.style.transform = "translate(-50%, -50%)";

      // set background-size so JS frame stepping lands on integers
      sprite.style.backgroundSize = `${spriteW * FRAME_COUNT}px ${spriteH}px`;
      // ensure no CSS animation conflicts
      sprite.style.animation = "none";

      // restart frame stepping (spriteW may change on resize). Use recursive
      // setTimeout so we can insert a longer pause after the final frame.
      if (intervalId) {
        clearTimeout(intervalId);
        intervalId = null;
      }
      frameIndex = 0;
      sprite.style.backgroundPosition = `0px 0px`;

      function step() {
        frameIndex = (frameIndex + 1) % FRAME_COUNT;
        const x = -frameIndex * spriteW;
        sprite.style.backgroundPosition = `${x}px 0px`;
        const isLast = frameIndex === FRAME_COUNT - 1;
        const delay = isLast
          ? FRAME_DURATION_MS + PAUSE_BETWEEN_LOOPS_MS
          : FRAME_DURATION_MS;
        intervalId = setTimeout(step, delay);
      }

      intervalId = setTimeout(step, FRAME_DURATION_MS);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    window.addEventListener("resize", update);
    // also update when the image loads (naturalWidth becomes available)
    img.addEventListener("load", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      img.removeEventListener("load", update);
      if (intervalId) clearTimeout(intervalId);
    };
  }, [showAuth]);

  function handlePlay() {
    if (user) return navigate("/play");
    setShowAuth(true);
  }

  return (
    <div className="home-root">
      <div className="home-bg" aria-hidden>
        <div className="home-artwork-wrapper" aria-hidden ref={wrapperRef}>
          <img
            ref={imgRef}
            src={
              showAuth ? "/images/KitchWCat.png" : "/images/KitchenNoCat.png"
            }
            alt="kitchen"
            className="home-artwork"
          />
          {!showAuth && (
            <div
              className="swat-sprite"
              aria-hidden
              data-frame={0}
              ref={spriteRef}
            />
          )}
        </div>
      </div>

      <div className="home-content">
        {!showAuth && (
          <>
            <img src="/images/KeyPaw.png" alt="Key Paw" className="home-logo" />
            <p className="subtitle">Pick, turn, and unlock — get the treats.</p>
          </>
        )}

        <button className="play-btn" onClick={handlePlay} aria-label="Play">
          <span className="arrow">▶</span>
          <span className="play-text">Play</span>
        </button>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => navigate("/play")}
        />
      )}
    </div>
  );
}
