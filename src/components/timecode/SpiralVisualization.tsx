import { useEffect, useRef } from 'react';

interface ResonantDate {
  cycleNumber: number;
  date: Date;
  cycleLength: string;
  isPast: boolean;
}

interface SpiralVisualizationProps {
  resonantDates: ResonantDate[];
  seedDate: Date;
}

export function SpiralVisualization({ resonantDates, seedDate }: SpiralVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw spiral base
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 500; i++) {
      const angle = i * 0.1;
      const radius = (i / 500) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw resonant points
    const now = new Date();
    resonantDates.forEach((rd, index) => {
      const totalDates = resonantDates.length;
      const angle = (index / totalDates) * Math.PI * 4 - Math.PI / 2;
      const radius = ((index + 1) / totalDates) * maxRadius;
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw connecting line to spiral
      ctx.beginPath();
      ctx.strokeStyle = rd.cycleNumber === 0 
        ? 'rgba(0, 255, 255, 0.6)' 
        : rd.isPast 
        ? 'rgba(100, 100, 100, 0.3)' 
        : 'rgba(255, 0, 255, 0.4)';
      ctx.lineWidth = rd.cycleNumber === 0 ? 2 : 1;
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, rd.cycleNumber === 0 ? 8 : 5, 0, Math.PI * 2);
      
      if (rd.cycleNumber === 0) {
        ctx.fillStyle = 'rgba(0, 255, 255, 1)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      } else if (rd.isPast) {
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 0, 255, 0.6)';
      }
      
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw label
      ctx.fillStyle = rd.cycleNumber === 0 ? '#00ffff' : rd.isPast ? '#888' : '#ff00ff';
      ctx.font = rd.cycleNumber === 0 ? '12px Inter' : '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(
        rd.cycleNumber === 0 ? 'SEED' : `${rd.cycleNumber > 0 ? '+' : ''}${rd.cycleNumber}`,
        x,
        y - 15
      );
    });

    // Draw center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw "NOW" indicator
    const nowAngle = Math.PI * 2 * 0.4;
    const nowRadius = maxRadius * 0.7;
    const nowX = centerX + nowRadius * Math.cos(nowAngle);
    const nowY = centerY + nowRadius * Math.sin(nowAngle);
    
    ctx.beginPath();
    ctx.arc(nowX, nowY, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('NOW', nowX, nowY + 20);

  }, [resonantDates, seedDate]);

  return (
    <div className="relative w-full aspect-square bg-card/30 rounded-lg border border-primary/20 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
        Fractal Time Spiral
      </div>
    </div>
  );
}
