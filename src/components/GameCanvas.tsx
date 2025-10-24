import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Pulse {
  x: number;
  y: number;
  targetTime: number;
  radius: number;
  phase: 'approaching' | 'critical' | 'passed';
}

interface PredictiveField {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  timestamp: number;
}

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [syncRate, setSyncRate] = useState(0);
  const [predictiveField, setPredictiveField] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const pulsesRef = useRef<Pulse[]>([]);
  const fieldsRef = useRef<PredictiveField[]>([]);
  const animationRef = useRef<number>();
  const lastPulseRef = useRef<number>(0);
  const anticipationWindowRef = useRef<number>(500); // ms before pulse arrives
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Neural background pattern
    const drawNeuralBackground = () => {
      ctx.fillStyle = 'hsl(230, 45%, 8%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle grid
      ctx.strokeStyle = 'hsla(230, 30%, 25%, 0.2)';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };
    
    // Draw predictive fields
    const drawPredictiveFields = () => {
      const now = Date.now();
      fieldsRef.current = fieldsRef.current.filter(field => {
        const age = now - field.timestamp;
        if (age > 2000) return false;
        
        const progress = age / 2000;
        const currentRadius = field.radius * (1 + progress * 2);
        const alpha = field.intensity * (1 - progress);
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          field.x, field.y, 0,
          field.x, field.y, currentRadius
        );
        gradient.addColorStop(0, `hsla(280, 90%, 65%, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `hsla(190, 100%, 55%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(310, 80%, 60%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(field.x, field.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        return true;
      });
    };
    
    // Draw pulses
    const drawPulses = () => {
      const now = Date.now();
      
      pulsesRef.current.forEach(pulse => {
        const timeUntilTarget = pulse.targetTime - now;
        const progress = 1 - (timeUntilTarget / 3000);
        
        if (progress < 0 || progress > 1) return;
        
        // Update phase
        if (timeUntilTarget > anticipationWindowRef.current) {
          pulse.phase = 'approaching';
        } else if (timeUntilTarget > -200) {
          pulse.phase = 'critical';
        } else {
          pulse.phase = 'passed';
        }
        
        // Calculate position (spiral inward)
        const angle = progress * Math.PI * 4;
        const distance = (1 - progress) * 200;
        const x = canvas.width / 2 + Math.cos(angle) * distance;
        const y = canvas.height / 2 + Math.sin(angle) * distance;
        
        // Color based on phase
        let color = 'hsla(190, 100%, 55%, 0.8)'; // approaching - cyan
        if (pulse.phase === 'critical') {
          color = 'hsla(310, 80%, 60%, 1)'; // critical - magenta
        } else if (pulse.phase === 'passed') {
          color = 'hsla(230, 30%, 40%, 0.5)'; // passed - muted
        }
        
        // Draw pulse with glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulse.radius * 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color.replace(/[\d.]+\)/, '0.3)'));
        gradient.addColorStop(1, color.replace(/[\d.]+\)/, '0)'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, pulse.radius * (1 + Math.sin(progress * Math.PI * 4) * 0.2), 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connecting line to center
        if (pulse.phase === 'critical') {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(canvas.width / 2, canvas.height / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      
      // Remove passed pulses
      pulsesRef.current = pulsesRef.current.filter(p => (p.targetTime - now) > -500);
    };
    
    // Draw center node (player's predictive field)
    const drawCenterNode = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 30 + predictiveField * 2;
      
      // Outer pulsing field
      const fieldGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius * 3
      );
      fieldGradient.addColorStop(0, `hsla(190, 100%, 55%, ${0.4 + syncRate * 0.3})`);
      fieldGradient.addColorStop(0.5, `hsla(280, 90%, 65%, ${0.2 + syncRate * 0.2})`);
      fieldGradient.addColorStop(1, 'hsla(310, 80%, 60%, 0)');
      
      ctx.fillStyle = fieldGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner core
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius
      );
      coreGradient.addColorStop(0, 'hsla(190, 100%, 75%, 1)');
      coreGradient.addColorStop(0.7, 'hsla(190, 100%, 55%, 0.8)');
      coreGradient.addColorStop(1, 'hsla(190, 100%, 55%, 0)');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();
    };
    
    // Main animation loop
    const animate = () => {
      drawNeuralBackground();
      drawPredictiveFields();
      drawPulses();
      drawCenterNode();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [predictiveField, syncRate]);
  
  // Spawn pulses
  useEffect(() => {
    if (!isPlaying) return;
    
    const spawnPulse = () => {
      const now = Date.now();
      const timeSinceLastPulse = now - lastPulseRef.current;
      
      // Adaptive timing based on sync rate
      const baseInterval = 3000;
      const adaptiveInterval = baseInterval - (syncRate * 500);
      
      if (timeSinceLastPulse > adaptiveInterval) {
        const newPulse: Pulse = {
          x: 0,
          y: 0,
          targetTime: now + 3000,
          radius: 15,
          phase: 'approaching'
        };
        pulsesRef.current.push(newPulse);
        lastPulseRef.current = now;
      }
      
      requestAnimationFrame(spawnPulse);
    };
    
    spawnPulse();
  }, [isPlaying, syncRate]);
  
  const handleCanvasClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      toast("Synchronization beginning...", { description: "Anticipate before the pulse arrives" });
      return;
    }
    
    const now = Date.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if any pulses are in critical phase
    let bestAnticipation = Infinity;
    let hitPulse: Pulse | null = null;
    
    pulsesRef.current.forEach(pulse => {
      const timeUntilTarget = pulse.targetTime - now;
      if (pulse.phase === 'critical' && Math.abs(timeUntilTarget) < Math.abs(bestAnticipation)) {
        bestAnticipation = timeUntilTarget;
        hitPulse = pulse;
      }
    });
    
    if (hitPulse && bestAnticipation > 0 && bestAnticipation < anticipationWindowRef.current) {
      // Perfect anticipation!
      const accuracy = 1 - (bestAnticipation / anticipationWindowRef.current);
      const points = Math.round(accuracy * 100);
      
      setScore(prev => prev + points);
      setSyncRate(prev => Math.min(1, prev + 0.1));
      setPredictiveField(prev => Math.min(100, prev + 5));
      
      // Create visual field
      fieldsRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 50 + points,
        intensity: accuracy,
        timestamp: now
      });
      
      // Remove the anticipated pulse
      pulsesRef.current = pulsesRef.current.filter(p => p !== hitPulse);
      
      if (accuracy > 0.8) {
        toast("Perfect Anticipation!", { description: `+${points} points` });
      } else {
        toast("Anticipated", { description: `+${points} points` });
      }
    } else {
      // Missed or too early
      setSyncRate(prev => Math.max(0, prev - 0.05));
      toast("Recalibrating...", { description: "Feel the rhythm" });
    }
  };
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
      />
      
      {/* HUD */}
      <div className="absolute top-8 left-8 space-y-4">
        <div className="backdrop-blur-sm bg-card/50 border border-primary/30 rounded-lg p-4 glow-cyan">
          <div className="text-sm text-muted-foreground">PREDICTIVE FIELD</div>
          <div className="text-3xl font-bold text-primary">{predictiveField}%</div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-secondary/30 rounded-lg p-4 glow-magenta">
          <div className="text-sm text-muted-foreground">SYNC RATE</div>
          <div className="text-3xl font-bold text-secondary">{Math.round(syncRate * 100)}%</div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-accent/30 rounded-lg p-4 glow-purple">
          <div className="text-sm text-muted-foreground">RESONANCE</div>
          <div className="text-3xl font-bold text-accent">{score}</div>
        </div>
      </div>
      
      {/* Instructions */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="backdrop-blur-md bg-card/70 border border-primary rounded-xl p-8 max-w-md glow-cyan pointer-events-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">PREDICTIVE</h2>
            <p className="text-foreground/80 mb-6">
              Anticipate the pulse before it arrives at the center. Don't react — predict. 
              Click when you feel the moment approaching.
            </p>
            <p className="text-sm text-muted-foreground">
              The system adapts to your rhythm. Find the flow.
            </p>
            <div className="mt-6 text-center">
              <span className="text-accent animate-pulse-glow">Click anywhere to begin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
