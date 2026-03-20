import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebHaptics } from 'web-haptics/react';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

/**
 * A custom hook to synthesize game sounds using the Web Audio API.
 * No external audio files are required.
 *
 * Theme: "The Forum" (Warm Stone / Ancient Rome)
 *
 * Design Philosophy — Physical-World Sound Modelling
 * ===================================================
 * Every sound is modelled after what would be heard in an ancient Roman
 * forum: stone game-pieces on a marble board, bronze bells, marble
 * chimes, and the ambient acoustics of a vaulted stone chamber.
 *
 * Key synthesis techniques used throughout:
 *   - Inharmonic sine pairs (ratio ≈ 1.47) for dense mineral resonance
 *   - Bandpass noise bursts for stone surface grit/texture
 *   - Highpass noise impulses for hard-surface impact transients
 *   - Frequency sweeps on filters to simulate material interactions
 *
 * Audio Profile:
 *   - Placement: Stone-on-marble "tok-click" (impact + inharmonic resonance + thump)
 *   - Movement:  Stone-slide-and-settle (scrape texture → settle impact)
 *   - Victory:   Bronze bell cascade — ascending marble chimes (forum celebration)
 *   - Defeat:    Stone slab thud + fading low drone (heavy, final)
 *   - Draw:      Two matched stone taps — a stalemate knock (neither wins)
 *   - UI Click:  Small pebble tap on marble — sharp, bright, minimal
 */
export type FeedbackMode = 'SOUND_AND_HAPTICS' | 'SOUND_ONLY' | 'HAPTICS_ONLY' | 'OFF';

export function useSoundEffects() {
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('SOUND_AND_HAPTICS');
  const [isMounted, setIsMounted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const { trigger: triggerHapticCore } = useWebHaptics();

  const isSoundEnabled = feedbackMode === 'SOUND_AND_HAPTICS' || feedbackMode === 'SOUND_ONLY';
  const isHapticsEnabled = feedbackMode === 'SOUND_AND_HAPTICS' || feedbackMode === 'HAPTICS_ONLY';

  const triggerHaptic = useCallback((pattern: number | number[] | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (isHapticsEnabled) {
      triggerHapticCore(pattern);
    }
  }, [isHapticsEnabled, triggerHapticCore]);

  // Initialize AudioContext lazily (browsers require user interaction first).
  // Returns a Promise that resolves to `true` only once the context is running.
  // All playX functions must `await initAudio()` before scheduling nodes so
  // that ctx.currentTime is advancing — otherwise sounds scheduled while the
  // context is suspended pile up and flush in a burst when resume() completes.
  const initAudio = useCallback(async (): Promise<boolean> => {
    if (!audioContextRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      // Pre-generate white noise buffer (1 second)
      const bufferSize = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }
    if (audioContextRef.current.state === 'suspended') {
      // Await the resume so ctx.currentTime is valid before we schedule nodes.
      await audioContextRef.current.resume();
    }
    return audioContextRef.current.state === 'running';
  }, []);

  // Proactively resume AudioContext when the tab regains focus.
  // Without this, resume() is called lazily inside initAudio() right before
  // scheduling sounds — but resume() is async (returns a Promise), so the
  // context may still be suspended when we try to schedule, causing lag
  // and timing glitches. By resuming on visibility/focus events, the context
  // is already running by the time the user clicks anything.
  useEffect(() => {
    const resumeCtx = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') resumeCtx();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', resumeCtx);
    // Also resume on any pointer/touch interaction as a fallback
    window.addEventListener('pointerdown', resumeCtx, { once: false });

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', resumeCtx);
      window.removeEventListener('pointerdown', resumeCtx);
    };
  }, []);

  // Persist feedback mode state
  useEffect(() => {
    const savedMode = localStorage.getItem('rota_feedback_mode') as FeedbackMode | null;
    const legacyMuted = localStorage.getItem('rota_muted');

    let initialMode: FeedbackMode = 'SOUND_AND_HAPTICS';
    if (savedMode) {
      initialMode = savedMode;
    } else if (legacyMuted !== null) {
      // Migrate legacy boolean
      const isMuted = JSON.parse(legacyMuted);
      initialMode = isMuted ? 'OFF' : 'SOUND_AND_HAPTICS';
      localStorage.removeItem('rota_muted');
      localStorage.setItem('rota_feedback_mode', initialMode);
    }

    // Defer state update to avoid synchronous state changes during initial render
    setTimeout(() => {
      setFeedbackMode(initialMode);
      setIsMounted(true);
    }, 0);
  }, []);

  const cycleFeedbackMode = useCallback(() => {
    setFeedbackMode(prev => {
      let next: FeedbackMode;
      switch (prev) {
        case 'SOUND_AND_HAPTICS':
          next = 'SOUND_ONLY';
          break;
        case 'SOUND_ONLY':
          next = 'HAPTICS_ONLY';
          break;
        case 'HAPTICS_ONLY':
          next = 'OFF';
          break;
        case 'OFF':
          next = 'SOUND_AND_HAPTICS';
          break;
      }
      localStorage.setItem('rota_feedback_mode', next);
      return next;
    });
  }, []);


  // ====================================================================
  //  SHARED HELPERS
  // ====================================================================

  /**
   * Play a "stone resonance" — the dense mineral body sound used by
   * placement, movement settle, and the click. Two sine oscillators at
   * inharmonic ratio (1 : 1.47) + a tiny bandpass noise grit burst.
   *
   * @param startTime   When the resonance begins (AudioContext time)
   * @param fundamental Base frequency in Hz (lower = heavier stone)
   * @param fundVol     Gain of the fundamental (0–1)
   * @param overVol     Gain of the inharmonic overtone (0–1)
   * @param gritVol     Gain of the surface grit burst (0–1)
   * @param decayTime   How long the resonance rings (seconds)
   */
  const playStoneResonance = useCallback((
    startTime: number,
    fundamental: number,
    fundVol: number,
    overVol: number,
    gritVol: number,
    decayTime: number
  ) => {
    if (!audioContextRef.current || !noiseBufferRef.current) return;
    const ctx = audioContextRef.current;

    // Fundamental
    const fund = ctx.createOscillator();
    const fundGain = ctx.createGain();
    fund.type = 'sine';
    fund.frequency.setValueAtTime(fundamental, startTime);
    fund.frequency.exponentialRampToValueAtTime(fundamental * 0.78, startTime + decayTime);
    fundGain.gain.setValueAtTime(0, startTime);
    fundGain.gain.linearRampToValueAtTime(fundVol, startTime + 0.003);
    fundGain.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime);
    fund.connect(fundGain);
    fundGain.connect(ctx.destination);
    fund.start(startTime);
    fund.stop(startTime + decayTime + 0.01);

    // Inharmonic Overtone (× 1.47 — mineral shimmer)
    const over = ctx.createOscillator();
    const overGain = ctx.createGain();
    over.type = 'sine';
    const overFreq = fundamental * 1.47;
    over.frequency.setValueAtTime(overFreq, startTime);
    over.frequency.exponentialRampToValueAtTime(overFreq * 0.79, startTime + decayTime * 0.7);
    overGain.gain.setValueAtTime(0, startTime);
    overGain.gain.linearRampToValueAtTime(overVol, startTime + 0.003);
    overGain.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime * 0.7);
    over.connect(overGain);
    overGain.connect(ctx.destination);
    over.start(startTime);
    over.stop(startTime + decayTime * 0.7 + 0.01);

    // Surface Grit
    if (gritVol > 0) {
      const grit = ctx.createBufferSource();
      grit.buffer = noiseBufferRef.current;
      const gritFilter = ctx.createBiquadFilter();
      gritFilter.type = 'bandpass';
      gritFilter.frequency.setValueAtTime(800, startTime);
      gritFilter.Q.value = 1.5;
      const gritGain = ctx.createGain();
      gritGain.gain.setValueAtTime(gritVol, startTime);
      gritGain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.025, decayTime * 0.3));
      grit.connect(gritFilter);
      gritFilter.connect(gritGain);
      gritGain.connect(ctx.destination);
      grit.start(startTime);
    }
  }, []);

  /**
   * Play an impact "crack" — the bright transient of hard surfaces meeting.
   * Used by placement, settle, and UI click at varying intensities.
   *
   * @param startTime   When the crack occurs
   * @param cutoffHz    Highpass filter frequency (higher = brighter/sharper)
   * @param volume      Peak gain (0–1)
   * @param decayMs     How quickly it dies (in seconds, typically 0.008–0.015)
   */
  const playImpactCrack = useCallback((
    startTime: number,
    cutoffHz: number,
    volume: number,
    decayMs: number
  ) => {
    if (!audioContextRef.current || !noiseBufferRef.current) return;
    const ctx = audioContextRef.current;

    const crack = ctx.createBufferSource();
    crack.buffer = noiseBufferRef.current;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(cutoffHz, startTime);
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + decayMs);
    crack.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    crack.start(startTime);
  }, []);


  // ====================================================================
  //  1. PLACEMENT — Stone Piece Set Down on Marble Board
  // ====================================================================
  // Physical model: a rounded stone pebble being placed (lightly dropped)
  // onto a hard marble/stone surface. Three acoustic layers:
  //   A. Impact Crack      – sharp high-freq noise burst (the "click")
  //   B. Stone Resonance   – inharmonic sine pair + grit (dense "tok")
  //   C. Board Thump       – low-freq surface absorption (the weight)
  // ====================================================================
  const playPlace = useCallback(async () => {
    triggerHaptic(15);
    if (!isSoundEnabled) return;
    const ready = await initAudio();
    if (!ready || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const t = ctx.currentTime;

    // A. Impact Crack
    playImpactCrack(t, 2000, 0.45, 0.012);

    // B. Stone Resonance (fundamental 180Hz, heavy piece)
    playStoneResonance(t, 180, 0.22, 0.12, 0.08, 0.10);

    // C. Board Thump
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(120, t);
    thump.frequency.exponentialRampToValueAtTime(80, t + 0.08);
    thumpGain.gain.setValueAtTime(0, t);
    thumpGain.gain.linearRampToValueAtTime(0.35, t + 0.003);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thump.start(t);
    thump.stop(t + 0.09);

  }, [isSoundEnabled, initAudio, triggerHaptic, playImpactCrack, playStoneResonance]);


  // ====================================================================
  //  2. MOVEMENT — Stone Sliding Along Marble Groove, Then Settling
  // ====================================================================
  // Physical model: a stone piece dragged a short distance along a
  // carved groove in a marble board, then dropping into the new position.
  // Four acoustic layers:
  //   A. Scraping Texture  – wider-band filtered noise sweep (the drag)
  //   B. Sub-Bass Weight   – gentle low sine providing mass to the slide
  //   C. Settle Crack      – delayed high-freq noise burst (arrival)
  //   D. Settle Resonance  – delayed inharmonic pair (piece resting)
  // ====================================================================
  const playMove = useCallback(async () => {
    triggerHaptic([20, 30, 20, 30, 30]);
    if (!isSoundEnabled) return;
    const ready = await initAudio();
    if (!ready || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const t = ctx.currentTime;
    const slideDuration = 0.16;
    const settleTime = t + slideDuration;

    // A. Scraping Texture
    const scrape = ctx.createBufferSource();
    scrape.buffer = noiseBufferRef.current;
    const scrapeFilter = ctx.createBiquadFilter();
    scrapeFilter.type = 'bandpass';
    scrapeFilter.frequency.setValueAtTime(600, t);
    scrapeFilter.frequency.linearRampToValueAtTime(1200, t + slideDuration * 0.5);
    scrapeFilter.frequency.linearRampToValueAtTime(400, settleTime);
    scrapeFilter.Q.value = 0.6;
    const scrapeGain = ctx.createGain();
    scrapeGain.gain.setValueAtTime(0, t);
    scrapeGain.gain.linearRampToValueAtTime(0.12, t + 0.015);
    scrapeGain.gain.linearRampToValueAtTime(0.15, t + slideDuration * 0.4);
    scrapeGain.gain.exponentialRampToValueAtTime(0.001, settleTime);
    scrape.connect(scrapeFilter);
    scrapeFilter.connect(scrapeGain);
    scrapeGain.connect(ctx.destination);
    scrape.start(t);

    // B. Sub-Bass Weight
    const weight = ctx.createOscillator();
    const weightGain = ctx.createGain();
    weight.type = 'sine';
    weight.frequency.setValueAtTime(90, t);
    weight.frequency.linearRampToValueAtTime(70, settleTime);
    weightGain.gain.setValueAtTime(0, t);
    weightGain.gain.linearRampToValueAtTime(0.12, t + 0.02);
    weightGain.gain.exponentialRampToValueAtTime(0.001, settleTime + 0.03);
    weight.connect(weightGain);
    weightGain.connect(ctx.destination);
    weight.start(t);
    weight.stop(settleTime + 0.04);

    // C. Settle Crack (delayed)
    playImpactCrack(settleTime, 2500, 0.25, 0.01);

    // D. Settle Resonance (lighter than placement — fundamental 220Hz)
    playStoneResonance(settleTime, 220, 0.14, 0.07, 0.05, 0.07);

  }, [isSoundEnabled, initAudio, triggerHaptic, playImpactCrack, playStoneResonance]);


  // ====================================================================
  //  3. VICTORY — Triumphant Ascending Fanfare (Roman Tuba)
  // ====================================================================
  // Design principle: same instrument family as defeat (filtered sawtooth
  // brass), but emotionally opposite — ascending major vs descending minor.
  // This symmetry means victory and defeat are clearly related as "end-game"
  // events (both break from the stone palette) while being unmistakably
  // different in mood.
  //
  // Musical model: a Roman tuba (straight war trumpet) sounding triumph.
  // A 4-note ascending C major phrase, each note louder and brighter,
  // culminating in a sustained power chord.
  //
  // Notes:   C4  → E4  → G4  → C5 (held, with G5 power 5th)
  // Timing:  0.0s  0.35s 0.65s 1.0s → sustain to ~3.5s
  // Filter:  progressively wider (brighter) on each note
  // Total:   ~3.5s
  // ====================================================================
  const playWin = useCallback(async () => {
    triggerHaptic('success');
    if (!isSoundEnabled) return;
    const ready = await initAudio();
    if (!ready || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    /**
     * Play a single brass note — filtered sawtooth with a lowpass envelope.
     * Same technique as defeat's horn, but with a brighter, more open filter
     * and an attack that grows more confident with each note.
     */
    const playBrassNote = (freq: number, start: number, dur: number, vol: number, brightness: number) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      // Lowpass filter — `brightness` controls how wide it opens
      // Higher brightness = more harmonics = more triumphant
      filter.type = 'lowpass';
      filter.Q.value = 1.5;
      filter.frequency.setValueAtTime(freq * 0.5, start);
      filter.frequency.linearRampToValueAtTime(freq * brightness, start + dur * 0.25);
      filter.frequency.setValueAtTime(freq * brightness * 0.9, start + dur * 0.7);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.3, start + dur);

      // Volume: confident attack, sustain, then fade
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + dur * 0.08); // Quick, confident attack
      gain.gain.setValueAtTime(vol * 0.85, start + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.01);
    };

    // Ascending C major fanfare — each note louder, brighter, more triumphant
    playBrassNote(261.63, now,        0.40, 0.10, 2.0);  // C4 — opening call
    playBrassNote(329.63, now + 0.35, 0.40, 0.12, 2.5);  // E4 — rising
    playBrassNote(392.00, now + 0.65, 0.45, 0.14, 3.0);  // G4 — climbing, brighter
    // C5 — the arrival: longest, loudest, brightest
    playBrassNote(523.25, now + 1.0,  2.20, 0.16, 3.5);

    // Power 5th on the final note — G5 layered on C5 for a full, triumphant chord
    playBrassNote(783.99, now + 1.1,  1.80, 0.08, 2.5);  // G5 — reinforcing 5th

    // Octave-below C3 drone anchors the final chord with gravitas
    const drone = ctx.createOscillator();
    const droneFilter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(130.81, now + 1.0); // C3
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(250, now + 1.0);
    droneFilter.Q.value = 0.5;
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.setValueAtTime(0, now + 1.0);
    droneGain.gain.linearRampToValueAtTime(0.06, now + 1.3);
    droneGain.gain.setValueAtTime(0.06, now + 2.5);
    droneGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(now + 1.0);
    drone.stop(now + 3.6);

  }, [isSoundEnabled, initAudio, triggerHaptic]);


  // ====================================================================
  //  4. DEFEAT — Descending Minor Lament (Muted Horn)
  // ====================================================================
  // Design principle: END-GAME sounds deliberately break the stone
  // material palette used during gameplay. While placement/movement are
  // percussive noise+resonance, defeat uses SUSTAINED TONAL oscillators
  // (filtered sawtooth → muted horn timbre). This texture shift signals
  // "the game is over" at a primal level — the ear knows immediately that
  // this isn't another piece being placed.
  //
  // Musical model: a Roman cornu (war horn) sounding retreat.
  // A 4-note descending minor phrase, each note softer and longer,
  // trailing off into silence.
  //
  // Notes:   Eb4 → Db4 → B3  → Bb3    (descending minor seconds)
  // Timing:  0.0s  0.5s  1.1s  1.8s    (decelerating)
  // Total:   ~3.5s
  // ====================================================================
  const playLoss = useCallback(async () => {
    triggerHaptic('error');
    if (!isSoundEnabled) return;
    const ready = await initAudio();
    if (!ready || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    /**
     * Play a single "horn" note — filtered sawtooth with a lowpass
     * envelope that opens and closes, simulating a muted brass instrument.
     */
    const playHornNote = (freq: number, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth'; // Rich in harmonics — brass foundation
      osc.frequency.setValueAtTime(freq, start);

      // Lowpass filter gives the "muted horn" quality
      filter.type = 'lowpass';
      filter.Q.value = 2;
      filter.frequency.setValueAtTime(freq * 0.8, start);
      filter.frequency.linearRampToValueAtTime(freq * 2.5, start + dur * 0.3);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.5, start + dur);

      // Volume envelope: gentle attack → sustain → long fade
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + dur * 0.15);
      gain.gain.setValueAtTime(vol * 0.9, start + dur * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.01);
    };

    // Descending minor lament — each note lower, softer, longer
    playHornNote(311.13, now,        0.55, 0.14);  // Eb4
    playHornNote(277.18, now + 0.50, 0.65, 0.12);  // Db4
    playHornNote(246.94, now + 1.10, 0.75, 0.10);  // B3
    playHornNote(233.08, now + 1.80, 1.50, 0.08);  // Bb3 — trailing off

    // Low sustained drone — binds the phrase together
    const drone = ctx.createOscillator();
    const droneFilter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(116.54, now); // Bb2
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(200, now);
    droneFilter.Q.value = 0.5;
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
    droneGain.gain.setValueAtTime(0.05, now + 2.0);
    droneGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(now);
    drone.stop(now + 3.6);

  }, [isSoundEnabled, initAudio, triggerHaptic]);


  // ====================================================================
  //  5. DRAW — Suspended Unresolved Tones
  // ====================================================================
  // Two tones a tritone apart (the most unstable interval in music)
  // that swell together, hover unresolved, and fade without ever
  // reaching a satisfying conclusion. The sonic equivalent of "nobody won."
  //
  // Uses filtered triangle waves for a hollow, pipe-like quality —
  // distinctly different from both the stone taps of gameplay AND the
  // brassy horn of defeat.
  //
  // Total duration: ~2.5s
  // ====================================================================
  const playDraw = useCallback(async () => {
    triggerHaptic('warning');
    if (!isSoundEnabled) return;
    const ready = await initAudio();
    if (!ready || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    /**
     * Play a sustained pipe tone — filtered triangle wave with vibrato.
     */
    const playPipeTone = (freq: number, vol: number) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Hollow, pipe-like
      osc.frequency.setValueAtTime(freq, now);

      // Gentle vibrato for a living, breath-like quality
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(4.5, now);
      lfoGain.gain.setValueAtTime(freq * 0.008, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 2.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, now);
      filter.Q.value = 0.5;

      // Slow swell → sustain → long, reluctant fade
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.6);
      gain.gain.setValueAtTime(vol * 0.95, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.6);
    };

    // Tritone pair — the interval that never resolves
    playPipeTone(246.94, 0.12);  // B3
    playPipeTone(349.23, 0.10);  // F4 (tritone above B)

    // Quiet octave-below sub tone for depth
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(123.47, now); // B2
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.04, now + 0.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 2.4);

  }, [isSoundEnabled, initAudio, triggerHaptic]);


  // ====================================================================
  //  6. UI CLICK — Small Pebble Tap on Marble
  // ====================================================================
  // Physical model: a tiny pebble or fingernail tapping on a marble
  // surface — bright, minimal, non-intrusive. Uses the same material
  // palette (stone resonance + impact crack) but at very low volume
  // and high pitch so it feels like a light touch.
  // ====================================================================
  const playClick = useCallback(async () => {
    triggerHaptic(15);
    if (!isSoundEnabled) return;
    const ready = await initAudio();
    if (!ready || !audioContextRef.current) return;

    const t = audioContextRef.current.currentTime;

    // Light, bright crack — small pebble
    playImpactCrack(t, 3500, 0.12, 0.006);

    // Tiny stone resonance — high pitch, very short, quiet
    playStoneResonance(t, 600, 0.04, 0.02, 0.01, 0.035);

  }, [isSoundEnabled, initAudio, triggerHaptic, playImpactCrack, playStoneResonance]);


  return {
    feedbackMode,
    cycleFeedbackMode,
    isMounted,
    playPlace,
    playMove,
    playWin,
    playLoss,
    playDraw,
    playClick
  };
}
