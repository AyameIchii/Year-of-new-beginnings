import { useEffect, useRef } from "react";
import { FIREWORK_COLORS } from "../constants";

/**
 * Hiệu ứng pháo hoa canvas toàn màn hình.
 * Props:
 *   active {boolean} — bật/tắt hiệu ứng
 */
export default function Fireworks({ active }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    function createBurst(x, y) {
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80;
        const speed = 2 + Math.random() * 6;
        particles.current.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 2 + Math.random() * 3,
          gravity: 0.08,
        });
      }
    }

    // Tạo nhiều đợt nổ cách nhau 300ms
    const timeouts = [];
    for (let i = 0; i < 6; i++) {
      timeouts.push(
        setTimeout(() => {
          createBurst(
            100 + Math.random() * (canvas.width  - 200),
             50 + Math.random() * (canvas.height * 0.5),
          );
        }, i * 300),
      );
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.alpha > 0.01);
      particles.current.forEach((p) => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= 0.012;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      timeouts.forEach(clearTimeout);
      cancelAnimationFrame(animRef.current);
      particles.current = [];
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
// Hiệu ứng pháo hoa toàn màn hình, dùng canvas để vẽ các hạt pháo hoa nổ tung. Mỗi lần active thay đổi sẽ tạo ra một loạt đợt nổ mới. Các hạt sẽ bay ra từ tâm nổ, chịu tác động của trọng lực và dần mờ đi cho đến khi biến mất hoàn toàn.
