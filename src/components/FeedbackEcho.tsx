interface Echo {
  x: number;
  y: number;
  timestamp: number;
  radius: number;
}

interface FeedbackEchoProps {
  echoes: Echo[];
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
}

export const drawFeedbackEchoes = ({ echoes, ctx }: FeedbackEchoProps) => {
  const now = Date.now();
  
  echoes.forEach(echo => {
    const age = now - echo.timestamp;
    if (age > 3000) return;
    
    const progress = age / 3000;
    const currentRadius = echo.radius * (1 + progress * 4);
    const alpha = 0.4 * (1 - progress);
    
    // Draw distortion waves
    for (let i = 0; i < 3; i++) {
      const offset = i * 0.2;
      const r = currentRadius * (1 + offset);
      
      const gradient = ctx.createRadialGradient(
        echo.x, echo.y, r * 0.8,
        echo.x, echo.y, r
      );
      
      // Dissonant purple/red for missed timing
      gradient.addColorStop(0, `hsla(320, 70%, 50%, ${alpha * 0.5})`);
      gradient.addColorStop(1, `hsla(0, 80%, 55%, 0)`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 - i * 0.5;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.arc(echo.x, echo.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
};
