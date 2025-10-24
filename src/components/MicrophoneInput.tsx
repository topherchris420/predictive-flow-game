import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicrophoneInputProps {
  onVoiceAnticipation: () => void;
  isEnabled: boolean;
  onToggle: () => void;
}

export const MicrophoneInput = ({ onVoiceAnticipation, isEnabled, onToggle }: MicrophoneInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (!isEnabled) {
      stopListening();
      return;
    }
    
    startListening();
    
    return () => stopListening();
  }, [isEnabled]);
  
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      setIsListening(true);
      detectVoiceActivity();
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };
  
  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsListening(false);
  };
  
  const detectVoiceActivity = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let lastTrigger = 0;
    const threshold = 140; // Voice detection threshold
    const cooldown = 800; // ms between triggers
    
    const check = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      // Detect voice spike
      const now = Date.now();
      if (average > threshold && now - lastTrigger > cooldown) {
        onVoiceAnticipation();
        lastTrigger = now;
      }
      
      animationRef.current = requestAnimationFrame(check);
    };
    
    check();
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={`${
        isListening 
          ? 'border-primary bg-primary/10 glow-cyan' 
          : 'border-muted-foreground/30'
      }`}
    >
      {isEnabled ? (
        <Mic className={`h-4 w-4 ${isListening ? 'text-primary animate-pulse-glow' : ''}`} />
      ) : (
        <MicOff className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};
