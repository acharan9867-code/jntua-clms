import React, { useEffect, useRef } from "react";
import "./ScorpionCursor.css";

export const ScorpionCursor: React.FC = () => {
  const scorpionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only enable on desktop/laptops with a mouse/trackpad pointer
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    document.documentElement.classList.add("has-scorpion-cursor");

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;
    let hasMoved = false;
    let lastParticleTime = 0;
    let animFrameId: number;

    const createParticle = (x: number, y: number) => {
      const now = performance.now();
      // Throttle particle creation to every 28ms to prevent DOM overload while maintaining smooth trail
      if (now - lastParticleTime < 28) return;
      lastParticleTime = now;

      const particle = document.createElement("div");
      particle.className = "scorpion-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      document.body.appendChild(particle);

      const anim = particle.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0)" },
        ],
        { duration: 500, easing: "ease-out" }
      );

      anim.onfinish = () => {
        particle.remove();
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        currentX = mouseX;
        currentY = mouseY;
        if (scorpionRef.current) {
          scorpionRef.current.classList.add("visible");
        }
      }

      createParticle(mouseX, mouseY);
    };

    const handleMouseLeave = () => {
      if (scorpionRef.current) {
        scorpionRef.current.classList.remove("visible");
      }
    };

    const handleMouseEnter = () => {
      if (hasMoved && scorpionRef.current) {
        scorpionRef.current.classList.add("visible");
      }
    };

    const animate = () => {
      if (hasMoved && scorpionRef.current) {
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;
        scorpionRef.current.style.left = `${currentX}px`;
        scorpionRef.current.style.top = `${currentY}px`;
      }
      animFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    animFrameId = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("has-scorpion-cursor");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animFrameId);
      // Clean up any stray particles
      document.querySelectorAll(".scorpion-particle").forEach((p) => p.remove());
    };
  }, []);

  return (
    <div className="scorpion" ref={scorpionRef} aria-hidden="true">
      <div className="tail" />
      <div className="sting" />

      <div className="claw left-claw" />
      <div className="claw right-claw" />

      <div className="leg l1" />
      <div className="leg l2" />
      <div className="leg l3" />

      <div className="leg r1" />
      <div className="leg r2" />
      <div className="leg r3" />

      <div className="head" />
      <div className="body" />
    </div>
  );
};
