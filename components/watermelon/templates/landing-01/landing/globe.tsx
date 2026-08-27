"use client";

import { useEffect, useRef } from "react";

// A round web of pixels wired to their neighbours. The points sit on a sphere
// so it can be turned, but the shading stays flat on purpose: it should read
// as a network, not a planet. Canvas, because it is ~1500 primitives a frame.
const RADIUS = 0.46; // share of the canvas's shorter side
const COUNT = 520;
const TILT = -0.3;

const POINTS: Array<[number, number, number]> = [];
const golden = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < COUNT; i++) {
  const y = 1 - (i / (COUNT - 1)) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  POINTS.push([Math.cos(theta) * ring, y, Math.sin(theta) * ring]);
}

// Neighbours in 3D, so the web wraps the surface instead of stitching across
// the silhouette. Below ~4 the mesh barely connects at all.
const EDGES: Array<[number, number]> = [];
const near = 4.2 / Math.sqrt(COUNT);
for (let i = 0; i < COUNT; i++) {
  for (let j = i + 1; j < COUNT; j++) {
    const dx = POINTS[i][0] - POINTS[j][0];
    const dy = POINTS[i][1] - POINTS[j][1];
    const dz = POINTS[i][2] - POINTS[j][2];
    if (dx * dx + dy * dy + dz * dz <= near * near) EDGES.push([i, j]);
  }
}

export default function Globe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Nothing moves on its own: rotation only changes while a pointer is held
    // down and dragged, and it stays where it is left.
    const rotation = { x: 0, y: TILT };
    let dragging: { id: number; x: number; y: number } | null = null;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * RADIUS;
      const pixel = Math.max(2, Math.round(r / 84));

      const cosY = Math.cos(rotation.x);
      const sinY = Math.sin(rotation.x);
      const cosX = Math.cos(rotation.y);
      const sinX = Math.sin(rotation.y);

      const projected = POINTS.map(([px, py, pz]) => {
        const x1 = px * cosY + pz * sinY;
        const z1 = -px * sinY + pz * cosY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;
        return { x: cx + x1 * r, y: cy - y2 * r, z: z2 };
      });

      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1;
      for (const [i, j] of EDGES) {
        const a = projected[i];
        const b = projected[j];
        ctx.strokeStyle = `rgba(255,255,255,${(a.z + b.z) / 2 > 0 ? 0.08 : 0.04})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      projected.forEach((point, i) => {
        const front = point.z > 0;
        ctx.fillStyle =
          i % 17 === 0
            ? `rgba(163,255,18,${front ? 0.7 : 0.35})`
            : `rgba(255,255,255,${front ? 0.5 : 0.22})`;
        ctx.fillRect(
          Math.round(point.x - pixel / 2),
          Math.round(point.y - pixel / 2),
          pixel,
          pixel,
        );
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || dragging.id !== event.pointerId) return;
      rotation.x += (event.clientX - dragging.x) * 0.006;
      rotation.y += (event.clientY - dragging.y) * -0.006;
      // Stop short of the poles so it never flips inside out.
      rotation.y = Math.max(-1.2, Math.min(1.2, rotation.y));
      dragging.x = event.clientX;
      dragging.y = event.clientY;
      draw();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragging?.id !== event.pointerId) return;
      dragging = null;
      canvas.style.cursor = "grab";
    };

    const onResize = () => {
      resize();
      draw();
    };

    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";
    resize();
    draw();
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", onResize);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
