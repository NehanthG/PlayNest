import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setHovering(true);
    const handleMouseLeave = () => setHovering(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.querySelectorAll("a, button, .clickable").forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.querySelectorAll("a, button, .clickable").forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: "transform 0.08s ease-out",
      }}
    >
      {/* Outer ring */}
      <div
        className={`absolute rounded-full transition-all duration-300 ease-out ${
          hovering ? "scale-125 opacity-95" : "scale-100 opacity-80"
        }`}
        style={{
          width: hovering ? "30px" : "26px",
          height: hovering ? "30px" : "26px",
          background:
            "radial-gradient(circle, rgba(255,180,80,0.4) 0%, rgba(255,160,60,0.2) 40%, rgba(255,150,50,0) 70%)",
          border: "1.5px solid rgba(90, 60, 20, 0.3)",
          boxShadow:
            "0 0 8px rgba(255,165,70,0.3), 0 0 2px rgba(100,70,30,0.2)",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Inner dot */}
      <div
        className={`rounded-full transition-all duration-200 ease-out`}
        style={{
          width: hovering ? "12px" : "10px",
          height: hovering ? "12px" : "10px",
          background:
            "radial-gradient(circle, rgba(255,140,50,1) 0%, rgba(255,120,30,1) 70%, rgba(255,100,0,0.9) 100%)",
          border: "1px solid rgba(255,240,220,0.9)",
          boxShadow:
            "0 0 6px rgba(255,160,90,0.7), 0 0 3px rgba(255,255,255,0.3)",
          transform: "translate(-50%, -50%)",
        }}
      ></div>
    </div>
  );
}
