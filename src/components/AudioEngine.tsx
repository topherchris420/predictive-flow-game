import { useEffect, useRef } from 'react';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private syncRate: number = 0;
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.3;
  }
  
  updateSyncRate(rate: number) {
    this.syncRate = rate;
  }
  
  playAmbientDrone() {
    if (!this.audioContext || !this.masterGain) return;
    
    // Base drone frequency
    const baseFreq = 110 + (this.syncRate * 55); // Rises with sync
    
    // Create multiple oscillators for richness
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 3];
    
    freqs.forEach((freq, i) => {
      const key = `drone_${i}`;
      
      // Remove existing oscillator
      const existing = this.oscillators.get(key);
      if (existing) {
        existing.stop();
        this.oscillators.delete(key);
      }
      
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      
      // Volume decreases for higher harmonics
      gain.gain.value = (0.15 / (i + 1)) * (0.5 + this.syncRate * 0.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start();
      this.oscillators.set(key, osc);
    });
  }
  
  playPulseSound(accuracy: number) {
    if (!this.audioContext || !this.masterGain) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Frequency rises with accuracy
    const freq = 440 + (accuracy * 440);
    osc.frequency.value = freq;
    osc.type = 'sine';
    
    // Filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = 2000 + (accuracy * 3000);
    filter.Q.value = 5;
    
    // Envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3 * accuracy, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }
  
  playAnticipationRipple() {
    if (!this.audioContext || !this.masterGain) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.5);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }
  
  playFeedbackEcho() {
    if (!this.audioContext || !this.masterGain) return;
    
    // Play a dissonant echo sound
    const freqs = [200, 233, 300]; // Slightly dissonant intervals
    
    freqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const delay = this.audioContext!.createDelay();
      
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      
      delay.delayTime.value = i * 0.1;
      gain.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 1);
      
      osc.connect(delay);
      delay.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(this.audioContext!.currentTime + i * 0.1);
      osc.stop(this.audioContext!.currentTime + 1 + i * 0.1);
    });
  }
  
  playFlowStateHarmony() {
    if (!this.audioContext || !this.masterGain) return;
    
    // Perfect harmonic series for flow state
    const baseFreq = 220;
    const harmonics = [1, 2, 3, 4, 5, 6, 8];
    
    harmonics.forEach((harmonic, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.frequency.value = baseFreq * harmonic;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gain.gain.linearRampToValueAtTime(0.1 / harmonic, this.audioContext!.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1 / harmonic, this.audioContext!.currentTime + 2);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 3);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start();
      osc.stop(this.audioContext!.currentTime + 3);
    });
  }
  
  stopAll() {
    this.oscillators.forEach(osc => osc.stop());
    this.oscillators.clear();
  }
  
  resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const useAudioEngine = () => {
  const engineRef = useRef<AudioEngine | null>(null);
  
  useEffect(() => {
    engineRef.current = new AudioEngine();
    
    return () => {
      engineRef.current?.stopAll();
    };
  }, []);
  
  return engineRef;
};
