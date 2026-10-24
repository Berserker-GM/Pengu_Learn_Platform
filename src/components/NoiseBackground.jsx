import { useEffect, useRef } from "react";

export default function NoiseBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawNoise = () => {
      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const random = Math.random() * 255;
        data[i] = random;
        data[i + 1] = random;
        data[i + 2] = random;
        data[i + 3] = 40; // opacity
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      drawNoise();
      animationFrameId = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: "black" }}
    />
  );
}
