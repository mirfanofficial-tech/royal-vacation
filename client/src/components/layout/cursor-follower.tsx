"use client";

import { useState, useEffect } from "react";

export function CursorFollower({ enabled = true }: { enabled?: boolean }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <img
      src="/assets/crown.png"
      alt=""
      className="pointer-events-none fixed z-[9999] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 p-1.5 backdrop-blur-sm transition-opacity duration-300"
      style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }}
    />
  );
}
