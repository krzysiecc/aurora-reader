import { useEffect, useRef } from "react";

/**
 * The signature aurora particle trail. Rebuilt from the original with proper
 * teardown: the old version registered a fresh rAF loop + listeners on every
 * render and never cleaned them up. This one runs a single loop for the
 * component's lifetime and cancels it (and removes listeners) on unmount.
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let rafId = 0;
    const mouse = { x: 0, y: 0 };

    class Particle {
      x = mouse.x;
      y = mouse.y;
      size = Math.random() * 18 + 1;
      speedX = Math.random() * 10 - 1;
      speedY = Math.random() * 3 - 5;
      hue = 165;
      alpha = 0.1;

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.hue < 205) this.hue++;
        if (this.alpha > 0) this.alpha -= 0.01;
        if (this.size > 0.2) this.size -= 0.2;
      }

      draw() {
        ctx!.fillStyle = `hsla(${this.hue}, 90%, 55%, ${this.alpha})`;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      for (let i = 0; i < 2; i++) particles.push(new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      particles = particles.filter((p) => p.size > 0.5);
      rafId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
