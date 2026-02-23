import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook to synthesize simple game sounds using the Web Audio API.
 * No external audio files are required.
 */
export function useSoundEffects() {
  const [muted, setMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext lazily (browsers require user interaction first)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Persist mute state
  useEffect(() => {
    const saved = localStorage.getItem('rota_muted');
    if (saved) {
      setMuted(JSON.parse(saved));
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem('rota_muted', JSON.stringify(next));
      return next;
    });
  }, []);

  // Helper to create a simple oscillator-based sound
  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
    if (muted) return;
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [muted, initAudio]);

  // Specific Game Sounds
  const playMove = useCallback(() => {
    // A low thud/clack for placing a stone
    // Using a low frequency sine wave with a quick decay mimics a heavy object hitting a surface
    if (muted) return;
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Triangle wave has a bit more "body" than sine
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15); // Pitch drop simulates impact

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [muted, initAudio]);

  const playWin = useCallback(() => {
    // A triumphant chord (Major Triad: C, E, G)
    playTone(523.25, 'sine', 0.6, 0.2); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.6, 0.2), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.8, 0.2), 200); // G5
  }, [playTone]);

  const playLoss = useCallback(() => {
    // A dissonant, descending sound
    playTone(150, 'sawtooth', 0.4, 0.1);
    setTimeout(() => playTone(140, 'sawtooth', 0.5, 0.1), 150);
  }, [playTone]);

  const playDraw = useCallback(() => {
      // Neutral, flat sound
      playTone(300, 'sine', 0.3, 0.1);
      setTimeout(() => playTone(300, 'sine', 0.3, 0.1), 150);
  }, [playTone]);

  const playClick = useCallback(() => {
    // A high, short blip for UI interactions
    playTone(800, 'sine', 0.05, 0.05);
  }, [playTone]);

  return {
    muted,
    toggleMute,
    playMove,
    playWin,
    playLoss,
    playDraw,
    playClick
  };
}
