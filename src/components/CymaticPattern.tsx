import { useEffect, useRef } from 'react';

interface CymaticPatternProps {
  intensity: number; // 0-1
  syncRate: number; // 0-1
  flowState: boolean;
}

export const CymaticPattern = ({ intensity, syncRate, flowState }: CymaticPatternProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let time = 0;
    
    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) / 2;
      
      time += 0.01 + (syncRate * 0.02);
      
      // Number of petals/nodes increases with sync rate
      const nodes = Math.floor(6 + syncRate * 12);
      
      // Draw cymatic rings
      const rings = flowState ? 12 : 6;
      for (let ring = 1; ring <= rings; ring++) {
        const radius = (maxRadius / rings) * ring;
        const alpha = (0.2 + intensity * 0.3) * (1 - ring / rings);
        
        ctx.beginPath();
        
        for (let i = 0; i <= nodes; i++) {
          const angle = (i / nodes) * Math.PI * 2;
          
          // Modulation creates the cymatic pattern
          const modulation = Math.sin(ring * 2 + time) * 0.2 + 
                           Math.cos(angle * nodes + time * 2) * 0.3;
          const r = radius * (1 + modulation * syncRate);
          
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        
        // Color gradient based on flow state
        if (flowState) {
          ctx.strokeStyle = `hsla(${190 + ring * 10}, 100%, 55%, ${alpha})`;
        } else {
          ctx.strokeStyle = `hsla(280, 90%, 65%, ${alpha})`;
        }
        ctx.lineWidth = 1 + syncRate;
        ctx.stroke();
      }
      
      // Draw connecting nodes
      if (syncRate > 0.3) {
        ctx.fillStyle = flowState 
          ? `hsla(190, 100%, 55%, ${syncRate * 0.6})`
          : `hsla(310, 80%, 60%, ${syncRate * 0.4})`;
        
        for (let i = 0; i < nodes; i++) {
          const angle = (i / nodes) * Math.PI * 2;
          const r = maxRadius * 0.7;
          const x = centerX + Math.cos(angle + time) * r;
          const y = centerY + Math.sin(angle + time) * r;
          
          ctx.beginPath();
          ctx.arc(x, y, 2 + syncRate * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      animationRef.current = requestAnimationFrame(drawPattern);
    };
    
    drawPattern();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, syncRate, flowState]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
  );
};
