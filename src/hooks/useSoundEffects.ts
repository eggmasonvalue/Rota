import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook to synthesize game sounds using the Web Audio API.
 * No external audio files are required.
 *
 * Theme: "Imperial Senate" - Sounds should be heavy, resonant, and stone-like.
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
  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.1, rampType: 'linear' | 'exponential' = 'exponential') => {
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
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02); // Fast attack
    if (rampType === 'exponential') {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    } else {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [muted, initAudio]);

  // Specific Game Sounds aligned with "Imperial Senate" theme

  const playPlace = useCallback(() => {
    // Heavy, dull thud - like placing a heavy stone piece on marble
    // Low frequency sine wave with very short decay
    if (muted) return;
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use a mix of low sine and filtered noise if possible, but keeping it simple with oscillators
    // A low triangle wave gives a bit more texture than sine
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1); // Pitch drop for weight

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01); // Sharp attack
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); // Short decay

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }, [muted, initAudio]);

  const playMove = useCallback(() => {
    // Stone sliding on stone: needs friction texture (filtered noise) + heavy base
    // This sounds more like a "shhh-clunk" or a heavy drag
    if (muted) return;
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const duration = 0.25;

    // 1. Friction Noise (The "Slide")
    // Create a buffer with white noise
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter the noise to make it sound like stone (low-pass + band-pass characteristics)
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(400, ctx.currentTime); // Center around 400Hz for "rough stone"
    noiseFilter.Q.value = 1.0; // Moderate resonance

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05); // Fade in
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration); // Fade out

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // 2. Low Frequency Rumble (The Weight)
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();

    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(60, ctx.currentTime); // Deep rumble
    rumble.frequency.linearRampToValueAtTime(40, ctx.currentTime + duration); // Pitch down

    rumbleGain.gain.setValueAtTime(0, ctx.currentTime);
    rumbleGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    rumbleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    // Start everything
    noise.start();
    rumble.start();
    rumble.stop(ctx.currentTime + duration);
  }, [muted, initAudio]);

  const playWin = useCallback(() => {
    // Triumphant, resonant chord (Major) - but ancient/solemn
    // C Major Chord: C4, E4, G4
    // Using sine waves for a pure, bell-like quality (senate bells/fanfare)
    if (muted) return;
    initAudio();

    const playNote = (freq: number, startTime: number, duration: number) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    if (audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        playNote(523.25, now, 1.5);       // C5
        playNote(659.25, now + 0.1, 1.5); // E5
        playNote(783.99, now + 0.2, 2.0); // G5 (sustained)
    }
  }, [muted, initAudio]);

  const playLoss = useCallback(() => {
    // Solemn, dissonant chord (Diminished or Minor)
    // C Minor: C4, Eb4, G4 - slow and low
    if (muted) return;
    initAudio();

    const playNote = (freq: number, startTime: number, duration: number) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Mellower, sadder tone
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.2); // Slower attack
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    if (audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        playNote(261.63, now, 2.0);       // C4
        playNote(311.13, now + 0.1, 2.0); // Eb4
        playNote(392.00, now + 0.2, 2.0); // G4
        // Add a dissonant tritone for defeat? Maybe too harsh. Stick to minor.
    }
  }, [muted, initAudio]);

  const playDraw = useCallback(() => {
      // Neutral, unresolved sound
      // Two notes a whole tone apart
      playTone(300, 'sine', 0.5, 0.15, 'linear');
      setTimeout(() => playTone(300, 'sine', 0.5, 0.15, 'linear'), 200);
  }, [playTone]);

  const playClick = useCallback(() => {
    // A clean, sharp click for UI - like a light stone tap
    playTone(1200, 'sine', 0.05, 0.03, 'exponential');
  }, [playTone]);

  return {
    muted,
    toggleMute,
    playPlace,
    playMove,
    playWin,
    playLoss,
    playDraw,
    playClick
  };
}
