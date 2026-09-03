"use client";

import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";

export function FlyingPlane({ enabled = true }: { enabled?: boolean }) {
  const [pos, setPos] = useState({ x: null as number | null, y: null as number | null });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const handleMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside) {
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        setPos({ x: null, y: null });
      }
    };

    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, [enabled]);

  const active = pos.x !== null && pos.y !== null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ display: enabled ? undefined : "none" }}
    >
      {active ? (
        <Plane
          className="absolute h-10 w-10 text-gold transition-all duration-300 ease-out -rotate-90"
          style={{
            left: (pos.x as number) - 20,
            top: (pos.y as number) + 4,
            opacity: 1,
          }}
        />
      ) : (
        <Plane
          className="absolute h-10 w-10 text-gold transition-all duration-300 ease-out -rotate-90"
          style={{
            left: "8%",
            top: "70%",
            opacity: 0,
          }}
        />
      )}
    </div>
  );
}
