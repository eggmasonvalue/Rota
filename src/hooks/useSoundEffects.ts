import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook to synthesize game sounds using the Web Audio API.
 * No external audio files are required.
 *
 * Theme: "The Forum" (Warm Stone)
 * Audio Profile:
 * - Placement: Heavy Travertine stone thud (Low freq impact + short grit)
 * - Movement: Gritty stone-on-stone slide (Filtered noise + rumble)
 * - Victory: Roman Fanfare (Brass-like Sawtooth waves)
 * - Defeat: Solemn Dissonance (Low frequency, minor/diminished intervals)
 * - UI Click: Sharp pebble tap
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

  // Helper: Play a simple tone
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
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); // Fast attack
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

  // ------------------------------------------------------------------
  // 1. PLACEMENT: Heavy Stone Thud
  // ------------------------------------------------------------------
  const playPlace = useCallback(() => {
    if (muted) return;
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const t = ctx.currentTime;

    // A. The Thud (Low Triangle Wave)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, t); // Start low
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15); // Drop lower for weight impact

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.02); // Sharp attack
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); // Short decay

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);

    // B. The "Click" of contact (High pass noise burst)
    // Simulates the stone surface hitting
    const noiseBufferSize = ctx.sampleRate * 0.05; // 50ms
    const buffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000; // Only high freqs for the "tick"

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

  }, [muted, initAudio]);


  // ------------------------------------------------------------------
  // 2. MOVEMENT: Gritty Stone Slide
  // ------------------------------------------------------------------
  const playMove = useCallback(() => {
    if (muted) return;
    initAudio();
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const t = ctx.currentTime;
    const duration = 0.35; // Slightly longer drag

    // A. Friction Noise (The "Grind")
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to isolate "stone scraping" frequencies
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(350, t);
    noiseFilter.Q.value = 2.0; // Sharper resonance for "grit"

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.linearRampToValueAtTime(0.12, t + 0.05); // Fade in
    noiseGain.gain.linearRampToValueAtTime(0, t + duration); // Fade out

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // B. Low Frequency Rumble (The Mass)
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();

    rumble.type = 'sawtooth'; // Sawtooth has more harmonics/roughness than sine
    rumble.frequency.setValueAtTime(45, t);
    rumble.frequency.linearRampToValueAtTime(30, t + duration); // Pitch down as it settles

    // Lowpass filter to tame the sawtooth harshness, keeping only the rumble
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 120;

    rumbleGain.gain.setValueAtTime(0, t);
    rumbleGain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    rumbleGain.gain.linearRampToValueAtTime(0, t + duration);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumble.start(t);
    rumble.stop(t + duration);

  }, [muted, initAudio]);


  // ------------------------------------------------------------------
  // 3. VICTORY: Roman Fanfare (Brass Simulation)
  // ------------------------------------------------------------------
  const playWin = useCallback(() => {
    if (muted) return;
    initAudio();

    const playBrassNote = (freq: number, startTime: number, duration: number) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth'; // Rich in harmonics, like brass
        osc.frequency.setValueAtTime(freq, startTime);

        // Filter envelope: "Wah" opening sound of brass
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(freq, startTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 3, startTime + 0.1); // Open up
        filter.frequency.exponentialRampToValueAtTime(freq, startTime + duration); // Close down

        // Amp envelope
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    if (audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        // C Major Fanfare
        playBrassNote(523.25, now, 0.4);       // C5 (short)
        playBrassNote(659.25, now + 0.2, 0.4); // E5 (short)
        playBrassNote(783.99, now + 0.4, 0.6); // G5 (medium)
        playBrassNote(1046.50, now + 0.6, 2.0); // C6 (long, triumphant)
    }
  }, [muted, initAudio]);


  // ------------------------------------------------------------------
  // 4. DEFEAT: Solemn Dissonance (Low Strings/Drones)
  // ------------------------------------------------------------------
  const playLoss = useCallback(() => {
    if (muted) return;
    initAudio();

    const playDroneNote = (freq: number, startTime: number, duration: number) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Mellow, solemn
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.5); // Slow swell
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    if (audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        // C Minor / Diminished feel - Low and ominous
        playDroneNote(130.81, now, 2.5); // C3
        playDroneNote(155.56, now + 0.1, 2.5); // Eb3
        playDroneNote(185.00, now + 0.2, 2.5); // Gb3 (Diminished 5th - tension)
    }
  }, [muted, initAudio]);


  // ------------------------------------------------------------------
  // 5. MISC
  // ------------------------------------------------------------------
  const playDraw = useCallback(() => {
      // Neutral un-resolving tone
      playTone(330, 'sine', 0.6, 0.1, 'linear'); // E4
      setTimeout(() => playTone(330, 'sine', 0.6, 0.1, 'linear'), 150);
  }, [playTone]);

  const playClick = useCallback(() => {
    // Sharp "Pebble" click - high pitch sine with instant decay
    playTone(1800, 'sine', 0.04, 0.03, 'exponential');
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
