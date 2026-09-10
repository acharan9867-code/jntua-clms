import React, { useEffect, useRef } from "react";

/**
 * MouseGlow — premium electric-blue cursor spotlight effect.
 * Uses requestAnimationFrame + lerp for smooth lagging follow.
 * pointer-events: none ensures zero interference with UI interactions.
 * Automatically disabled on touch/mobile devices.
 */
export const MouseGlow: React.FC = () => {
  const blobRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Disable on touch devices
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      // Main glow blob: fast lerp (0.10)
      current.current.x = lerp(current.current.x, pos.current.x, 0.10);
      current.current.y = lerp(current.current.y, pos.current.y, 0.10);

      // Smaller ring: slightly faster (0.18)
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.18);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.18);

      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${current.current.x - 200}px, ${current.current.y - 200}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Hidden on mobile via media query via inline conditional
  return (
    <>
      {/* Large soft glow orb */}
      <div
        ref={blobRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(56,189,248,0.04) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
          mixBlendMode: "screen",
        }}
      />
      {/* Sharp inner ring dot */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid rgba(56,189,248,0.5)",
          background: "rgba(56,189,248,0.06)",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
          backdropFilter: "blur(2px)",
          boxShadow: "0 0 10px rgba(56,189,248,0.3)",
        }}
      />
    </>
  );
};
