"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SoapBubble {
  id: number;
  xPercent: number; // 0 - 100% across the header
  topOffset: number; // px from top
  size: number; // diameter in px
  delay: number; // animation delay in seconds
  duration: number; // float duration
  swayDist: number; // horizontal sway distance
  isPopped?: boolean;
}

export default function HeaderFoamDrips() {
  const [bubbles, setBubbles] = useState<SoapBubble[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate hyper-realistic 3D soap bubbles distributed along the foam header
  useEffect(() => {
    const bubbleList: SoapBubble[] = [
      // Cluster 1 (Left - near logo)
      { id: 1, xPercent: 3.5, topOffset: 28, size: 28, delay: 0, duration: 4.5, swayDist: 6 },
      { id: 2, xPercent: 6.2, topOffset: 42, size: 40, delay: 0.8, duration: 5.2, swayDist: -8 },
      { id: 3, xPercent: 8.8, topOffset: 34, size: 20, delay: 1.4, duration: 3.8, swayDist: 5 },
      { id: 4, xPercent: 11.5, topOffset: 48, size: 32, delay: 0.4, duration: 4.8, swayDist: -7 },

      // Cluster 2 (Mid-Left)
      { id: 5, xPercent: 17.5, topOffset: 32, size: 24, delay: 1.1, duration: 4.2, swayDist: 8 },
      { id: 6, xPercent: 21.0, topOffset: 46, size: 44, delay: 0.3, duration: 5.5, swayDist: -9 },
      { id: 7, xPercent: 25.2, topOffset: 36, size: 22, delay: 1.8, duration: 3.9, swayDist: 6 },
      { id: 8, xPercent: 28.5, topOffset: 54, size: 36, delay: 0.7, duration: 4.9, swayDist: -8 },

      // Cluster 3 (Center)
      { id: 9, xPercent: 36.0, topOffset: 38, size: 30, delay: 1.3, duration: 4.4, swayDist: 7 },
      { id: 10, xPercent: 41.5, topOffset: 52, size: 48, delay: 0.1, duration: 5.8, swayDist: -10 },
      { id: 11, xPercent: 46.2, topOffset: 35, size: 26, delay: 1.6, duration: 4.0, swayDist: 8 },
      { id: 12, xPercent: 51.0, topOffset: 56, size: 40, delay: 0.5, duration: 5.0, swayDist: -9 },
      { id: 13, xPercent: 55.8, topOffset: 38, size: 22, delay: 1.9, duration: 3.7, swayDist: 5 },

      // Cluster 4 (Mid-Right)
      { id: 14, xPercent: 63.5, topOffset: 48, size: 42, delay: 0.2, duration: 5.3, swayDist: -8 },
      { id: 15, xPercent: 68.2, topOffset: 34, size: 24, delay: 1.2, duration: 4.1, swayDist: 7 },
      { id: 16, xPercent: 72.8, topOffset: 52, size: 38, delay: 0.9, duration: 4.7, swayDist: -9 },
      { id: 17, xPercent: 77.0, topOffset: 40, size: 28, delay: 1.5, duration: 4.3, swayDist: 6 },

      // Cluster 5 (Right - near actions)
      { id: 18, xPercent: 84.5, topOffset: 48, size: 46, delay: 0.4, duration: 5.6, swayDist: -10 },
      { id: 19, xPercent: 89.2, topOffset: 36, size: 26, delay: 1.7, duration: 4.0, swayDist: 7 },
      { id: 20, xPercent: 93.0, topOffset: 56, size: 34, delay: 0.6, duration: 4.6, swayDist: -8 },
      { id: 21, xPercent: 96.5, topOffset: 42, size: 24, delay: 1.0, duration: 3.9, swayDist: 5 },
    ];
    setBubbles(bubbleList);
  }, []);

  // Handle pop bubble on click or touch
  const handlePop = (id: number) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPopped: true } : b))
    );
    // Regenerate after a short delay
    setTimeout(() => {
      setBubbles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isPopped: false } : b))
      );
    }, 2800);
  };

  return (
    <div
      ref={containerRef}
      className="absolute -bottom-8 sm:-bottom-10 translate-y-[18px] left-3 right-3 sm:left-6 sm:right-6 pointer-events-none z-10 select-none overflow-visible"
    >
      {/* 1. DENSE FOAM CANOPY (Realistic Snow Foam Lather like in reference) */}
      <div className="relative w-full h-20 sm:h-26 overflow-visible">
        {/* Photorealistic Foam Border with True Alpha Transparency & Soft Feathered Rounded Tips */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none origin-top rounded-b-3xl"
          style={{
            backgroundImage: "url('/images/foam_header_banner.png')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "top center",
            filter: "drop-shadow(0 4px 14px rgba(0, 240, 255, 0.25))",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
          }}
        />

        {/* Soft Cyan/White Ambient Crest Glow */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cyan-400/15 via-white/10 to-transparent blur-md pointer-events-none" />

        {/* 2. HYPER-REALISTIC 3D GLASS SOAP BUBBLES (Matching reference image) */}
        {bubbles.map((b) => {
          if (b.isPopped) {
            return (
              <div
                key={b.id}
                className="absolute pointer-events-none animate-ping"
                style={{
                  left: `${b.xPercent}%`,
                  top: `${b.topOffset}px`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                }}
              >
                <div className="w-full h-full rounded-full border border-cyan-400 opacity-60 scale-125" />
              </div>
            );
          }

          return (
            <div
              key={b.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${b.xPercent}%`,
                top: `${b.topOffset}px`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                animation: `bubbleFloat ${b.duration}s ease-in-out infinite alternate`,
                animationDelay: `${b.delay}s`,
              }}
            >
              {/* Outer Glassmorphic Sphere */}
              <div
                className="relative w-full h-full rounded-full border border-white/50 backdrop-blur-[1px] shadow-[inset_0_0_12px_rgba(255,255,255,0.45),0_4px_16px_rgba(0,240,255,0.18)] transition-all"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(0, 240, 255, 0.15) 85%, rgba(186, 230, 253, 0.3) 100%)",
                }}
              >
                {/* Upper Left Glossy Crescent Reflection */}
                <div
                  className="absolute rounded-full bg-white opacity-90 blur-[0.3px]"
                  style={{
                    top: "14%",
                    left: "18%",
                    width: "38%",
                    height: "22%",
                    transform: "rotate(-35deg)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 100%)",
                  }}
                />

                {/* Secondary Micro-Highlight Dot */}
                <div
                  className="absolute rounded-full bg-white opacity-95"
                  style={{
                    top: "30%",
                    left: "15%",
                    width: "12%",
                    height: "12%",
                  }}
                />

                {/* Lower Right Translucent Rainbow Rim Highlight */}
                <div
                  className="absolute rounded-full opacity-60"
                  style={{
                    bottom: "10%",
                    right: "12%",
                    width: "45%",
                    height: "22%",
                    transform: "rotate(30deg)",
                    background:
                      "radial-gradient(ellipse at center, rgba(0,240,255,0.8) 0%, rgba(236,72,153,0.3) 60%, transparent 100%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes bubbleFloat {
          0% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) translateX(4px) scale(1.04);
          }
          100% {
            transform: translateY(-16px) translateX(-4px) scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}
