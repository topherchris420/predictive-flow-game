import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAudioEngine } from './AudioEngine';
import { MicrophoneInput } from './MicrophoneInput';
import { CymaticPattern } from './CymaticPattern';
import { drawFeedbackEchoes } from './FeedbackEcho';
import { Keyboard } from 'lucide-react';

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

interface FeedbackEcho {
  x: number;
  y: number;
  timestamp: number;
  radius: number;
}

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [syncRate, setSyncRate] = useState(0);
  const [predictiveField, setPredictiveField] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [flowState, setFlowState] = useState(false);
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  
  const pulsesRef = useRef<Pulse[]>([]);
  const fieldsRef = useRef<PredictiveField[]>([]);
  const echoesRef = useRef<FeedbackEcho[]>([]);
  const animationRef = useRef<number>();
  const lastPulseRef = useRef<number>(0);
  const anticipationWindowRef = useRef<number>(500); // ms before pulse arrives
  const audioEngineRef = useAudioEngine();
  const playerRhythmRef = useRef<number[]>([]); // Track player's timing pattern
  
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
    
    // Draw feedback echoes (for mistimed inputs)
    const drawEchoes = () => {
      const now = Date.now();
      echoesRef.current = echoesRef.current.filter(echo => (now - echo.timestamp) < 3000);
      
      drawFeedbackEchoes({
        echoes: echoesRef.current,
        ctx,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });
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
        
        // Draw hint ripples for approaching pulses (gradually fade with experience)
        if (pulse.phase === 'approaching' && showHints) {
          const hintAlpha = (0.3 - syncRate * 0.25) * (1 - progress);
          ctx.strokeStyle = `hsla(190, 100%, 55%, ${hintAlpha})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(x, y, pulse.radius * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
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
      
      // Outer pulsing field (more intense in flow state)
      const fieldGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius * (flowState ? 4 : 3)
      );
      
      if (flowState) {
        fieldGradient.addColorStop(0, `hsla(190, 100%, 65%, ${0.6})`);
        fieldGradient.addColorStop(0.3, `hsla(280, 90%, 65%, ${0.4})`);
        fieldGradient.addColorStop(0.6, `hsla(310, 80%, 60%, ${0.2})`);
        fieldGradient.addColorStop(1, 'hsla(190, 100%, 55%, 0)');
      } else {
        fieldGradient.addColorStop(0, `hsla(190, 100%, 55%, ${0.4 + syncRate * 0.3})`);
        fieldGradient.addColorStop(0.5, `hsla(280, 90%, 65%, ${0.2 + syncRate * 0.2})`);
        fieldGradient.addColorStop(1, 'hsla(310, 80%, 60%, 0)');
      }
      
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
      drawEchoes();
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
  }, [predictiveField, syncRate, flowState, showHints]);
  
  // Update audio based on sync rate
  useEffect(() => {
    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.updateSyncRate(syncRate);
      audioEngineRef.current.playAmbientDrone();
    }
  }, [syncRate, isPlaying]);
  
  // Detect flow state
  useEffect(() => {
    if (consecutiveHits >= 10 && syncRate > 0.7 && !flowState) {
      setFlowState(true);
      audioEngineRef.current?.playFlowStateHarmony();
      toast("FLOW STATE ACHIEVED", { 
        description: "You are synchronized with the pattern",
        duration: 5000
      });
    } else if (consecutiveHits < 5 && flowState) {
      setFlowState(false);
    }
    
    // Gradually hide hints as player improves
    if (syncRate > 0.5 && showHints) {
      setTimeout(() => setShowHints(false), 3000);
    }
  }, [consecutiveHits, syncRate, flowState, showHints]);
  
  // Spawn pulses with adaptive timing
  useEffect(() => {
    if (!isPlaying) return;
    
    const spawnPulse = () => {
      const now = Date.now();
      const timeSinceLastPulse = now - lastPulseRef.current;
      
      // Learn from player's rhythm
      let predictedInterval = 3000;
      if (playerRhythmRef.current.length >= 3) {
        const recentRhythms = playerRhythmRef.current.slice(-5);
        const avgInterval = recentRhythms.reduce((a, b) => a + b, 0) / recentRhythms.length;
        predictedInterval = avgInterval * 0.7 + 3000 * 0.3; // Blend with base
      }
      
      // Adaptive timing based on sync rate and flow state
      const baseInterval = flowState ? predictedInterval * 0.8 : predictedInterval;
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
  }, [isPlaying, syncRate, flowState]);
  
  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleAnticipation();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);
  
  const handleAnticipation = useCallback(() => {
    audioEngineRef.current?.resume();
    const now = Date.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Record timing for rhythm learning
    if (lastPulseRef.current > 0) {
      const timeSinceLastPulse = now - lastPulseRef.current;
      playerRhythmRef.current.push(timeSinceLastPulse);
      if (playerRhythmRef.current.length > 10) {
        playerRhythmRef.current.shift();
      }
    }
    
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
      setConsecutiveHits(prev => prev + 1);
      
      // Play audio feedback
      audioEngineRef.current?.playPulseSound(accuracy);
      
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
      // Missed or too early - create feedback echo instead of penalty
      setSyncRate(prev => Math.max(0, prev - 0.02)); // Smaller penalty
      setConsecutiveHits(0);
      
      // Create feedback echo
      echoesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 40,
        timestamp: now
      });
      
      audioEngineRef.current?.playFeedbackEcho();
      toast("Feedback Echo", { description: "The pattern shifts..." });
    }
  }, [flowState]);
  
  const handleCanvasClick = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      audioEngineRef.current?.resume();
      toast("Synchronization beginning...", { 
        description: "Tap, press Space, or use voice to anticipate" 
      });
      return;
    }
    
    handleAnticipation();
  };
  
  const handleCanvasTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    handleCanvasClick();
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Cymatic background pattern */}
      <div className="absolute inset-0">
        <CymaticPattern 
          intensity={predictiveField / 100}
          syncRate={syncRate}
          flowState={flowState}
        />
      </div>
      
      <canvas
        ref={canvasRef}
        className="relative w-full h-full cursor-crosshair touch-none"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasTouch}
      />
      
      {/* Controls */}
      <div className="absolute top-4 md:top-8 right-4 md:right-8 flex gap-2 md:gap-3">
        <MicrophoneInput 
          onVoiceAnticipation={handleAnticipation}
          isEnabled={micEnabled}
          onToggle={() => setMicEnabled(!micEnabled)}
        />
        <div className="hidden sm:flex backdrop-blur-sm bg-card/50 border border-primary/30 rounded-lg px-3 py-2 items-center gap-2">
          <Keyboard className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">SPACE</span>
        </div>
      </div>
      
      {/* Flow State Indicator */}
      {flowState && (
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2">
          <div className="backdrop-blur-md bg-primary/20 border-2 border-primary rounded-full px-4 py-2 md:px-8 md:py-3 glow-cyan animate-pulse-glow">
            <div className="text-sm md:text-xl font-bold text-primary tracking-widest">
              ⟡ FLOW STATE ⟡
            </div>
          </div>
        </div>
      )}
      
      {/* HUD */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 space-y-2 md:space-y-4">
        <div className="backdrop-blur-sm bg-card/50 border border-primary/30 rounded-lg p-2 md:p-4 glow-cyan">
          <div className="text-xs md:text-sm text-muted-foreground">PREDICTIVE FIELD</div>
          <div className="text-xl md:text-3xl font-bold text-primary">{predictiveField}%</div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-secondary/30 rounded-lg p-2 md:p-4 glow-magenta">
          <div className="text-xs md:text-sm text-muted-foreground">SYNC RATE</div>
          <div className="text-xl md:text-3xl font-bold text-secondary">{Math.round(syncRate * 100)}%</div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-accent/30 rounded-lg p-2 md:p-4 glow-purple">
          <div className="text-xs md:text-sm text-muted-foreground">RESONANCE</div>
          <div className="text-xl md:text-3xl font-bold text-accent">{score}</div>
        </div>
        
        <div className="backdrop-blur-sm bg-card/50 border border-foreground/20 rounded-lg p-2 md:p-4">
          <div className="text-xs md:text-sm text-muted-foreground">STREAK</div>
          <div className="text-xl md:text-3xl font-bold text-foreground">{consecutiveHits}</div>
        </div>
      </div>
      
      {/* Instructions */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-3 md:p-4">
          <div className="backdrop-blur-md bg-card/90 border border-primary rounded-xl p-4 md:p-8 max-w-md w-full glow-cyan pointer-events-auto shadow-2xl">
            <h2 className="text-lg md:text-2xl font-bold text-primary mb-3 md:mb-4">PREDICTIVE</h2>
            <p className="text-xs md:text-base text-foreground/80 mb-3 md:mb-4 leading-relaxed">
              Anticipate the pulse before it arrives at the center. Don't react — predict.
            </p>
            <div className="space-y-2 md:space-y-3 mb-3 md:mb-6 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <span>Tap, press SPACE, or use voice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0"></div>
                <span>System learns your rhythm patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></div>
                <span>Reach flow state through synchronization</span>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4 italic leading-relaxed">
              Wrong timing creates feedback echoes that shift the pattern
            </p>
            <div className="mt-3 md:mt-6 text-center">
              <span className="text-sm md:text-base text-accent animate-pulse-glow font-medium">Tap anywhere to begin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
