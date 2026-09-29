/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Musical notes frequencies in Hz
const NOTES: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

// Aarti Melody structure for "Om Jai Ishwati Mata"
// Note name, duration in beats (1 beat = 0.6 seconds at 100 BPM)
interface MelodyNote {
  note: string;
  duration: number; // in beats
  lyricMR: string;
  lyricEN: string;
}

const AARTI_SCORE: MelodyNote[] = [
  // Line 1: ॐ जय ईश्वटी माता (Om Jai Ishwati Mata)
  { note: 'G4', duration: 1.0, lyricMR: 'ॐ', lyricEN: 'Om' },
  { note: 'G4', duration: 1.0, lyricMR: 'जय', lyricEN: 'Jai' },
  { note: 'G4', duration: 1.5, lyricMR: 'ईश्वटी', lyricEN: 'Ishwati' },
  { note: 'A4', duration: 0.5, lyricMR: '—', lyricEN: '—' },
  { note: 'G4', duration: 1.0, lyricMR: 'मा', lyricEN: 'Ma' },
  { note: 'E4', duration: 1.5, lyricMR: 'ता', lyricEN: 'ta' },
  { note: 'F4', duration: 0.5, lyricMR: '—', lyricEN: '—' },
  { note: 'G4', duration: 2.0, lyricMR: '॥', lyricEN: '॥' },

  // Line 2: मैया जय ईश्वटी माता (Maiya Jai Ishwati Mata)
  { note: 'C5', duration: 1.0, lyricMR: 'मैया', lyricEN: 'Maiya' },
  { note: 'C5', duration: 1.0, lyricMR: 'जय', lyricEN: 'Jai' },
  { note: 'B4', duration: 1.0, lyricMR: 'ईश्व', lyricEN: 'Ishwa' },
  { note: 'A4', duration: 1.0, lyricMR: 'टी', lyricEN: 'ti' },
  { note: 'G4', duration: 1.5, lyricMR: 'मा', lyricEN: 'Ma' },
  { note: 'A4', duration: 0.5, lyricMR: '—', lyricEN: '—' },
  { note: 'G4', duration: 2.0, lyricMR: 'ता', lyricEN: 'ta ॥' },

  // Line 3: जो ध्यावे फल पावे (Jo Dhyave Phal Pave)
  { note: 'D5', duration: 1.0, lyricMR: 'जो', lyricEN: 'Jo' },
  { note: 'D5', duration: 1.0, lyricMR: 'ध्यावे', lyricEN: 'dhyave' },
  { note: 'C5', duration: 1.0, lyricMR: 'फल', lyricEN: 'phal' },
  { note: 'B4', duration: 1.0, lyricMR: 'पावे', lyricEN: 'pave' },
  { note: 'A4', duration: 1.0, lyricMR: 'दुःख', lyricEN: 'dukh' },
  { note: 'G4', duration: 1.0, lyricMR: 'बिनसे', lyricEN: 'binase' },
  { note: 'F4', duration: 1.0, lyricMR: 'मन', lyricEN: 'man' },
  { note: 'E4', duration: 1.0, lyricMR: 'का', lyricEN: 'ka' },

  // Line 4: सुख संपत्ती घर आवे (Sukh Sampatti Ghar Aave)
  { note: 'F4', duration: 1.0, lyricMR: 'सुख', lyricEN: 'Sukh' },
  { note: 'G4', duration: 1.0, lyricMR: 'संप', lyricEN: 'sampat-' },
  { note: 'A4', duration: 1.0, lyricMR: 'त्ती', lyricEN: 'ti' },
  { note: 'B4', duration: 1.0, lyricMR: 'घर', lyricEN: 'ghar' },
  { note: 'C5', duration: 2.0, lyricMR: 'आवे', lyricEN: 'aave' },
  { note: 'G4', duration: 2.0, lyricMR: '॥', lyricEN: '॥' },

  // Refrain: ॐ जय ईश्वटी माता (Om Jai Ishwati Mata)
  { note: 'G4', duration: 1.0, lyricMR: 'ॐ', lyricEN: 'Om' },
  { note: 'G4', duration: 1.0, lyricMR: 'जय', lyricEN: 'Jai' },
  { note: 'A4', duration: 1.0, lyricMR: 'ईश्वटी', lyricEN: 'Ishwati' },
  { note: 'G4', duration: 1.0, lyricMR: 'मा', lyricEN: 'Ma' },
  { note: 'F4', duration: 1.0, lyricMR: '—', lyricEN: '—' },
  { note: 'E4', duration: 2.0, lyricMR: 'ता', lyricEN: 'ta ॥' },
];

export class AartiAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Drone nodes
  private droneOscs: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // Melody state
  private isPlaying: boolean = false;
  private loopTimer: number | null = null;
  private tempoSecondsPerBeat: number = 0.55; // ~109 BPM devotional pace
  private lyricListeners: Set<(mr: string, en: string) => void> = new Set();
  private stateListeners: Set<(playing: boolean) => void> = new Set();
  private activeNoteNodes: { stop: () => void }[] = [];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      // Support standard and webkit prefixes
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Compressor for warm acoustic glue
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Realtime Analyser for UI visualizers
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect: Compressor -> MasterGain -> Analyser -> Destination
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.05);
    }
  }

  public onStateChange(listener: (playing: boolean) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyStateChange() {
    this.stateListeners.forEach(listener => {
      try {
        listener(this.isPlaying);
      } catch (err) {
        console.error(err);
      }
    });
  }

  public onLyricChange(callback: (mr: string, en: string) => void): () => void {
    this.lyricListeners.add(callback);
    return () => {
      this.lyricListeners.delete(callback);
    };
  }

  private notifyLyric(mr: string, en: string) {
    this.lyricListeners.forEach(callback => {
      try {
        callback(mr, en);
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Start Tanpura Drone (Sa - Pa - Sa sacred harmonics)
   */
  private startTanpuraDrone(ctx: AudioContext) {
    this.stopTanpuraDrone();

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 2.0);

    // Warm Low-pass filter for acoustic resonance
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(480, ctx.currentTime);

    // Sacred OM Root frequency base ~136.1 Hz (C#3/D3 range)
    const fundamental = 136.1;
    const droneFrequencies = [
      fundamental, // Root Sa (Bass)
      fundamental * 1.5, // Pa (Fifth ~204.15 Hz)
      fundamental * 2.0, // Middle Sa (~272.2 Hz)
      fundamental * 2.01, // Middle Sa chorused (+1.5 Hz shimmer)
    ];

    droneFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      // Alternating waveforms for organic acoustic thickness
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Subtle LFO vibrato on the strings
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.05, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.6, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(this.droneFilter!);
      osc.start();
      this.droneOscs.push(osc);
    });

    this.droneFilter.connect(this.droneGain);
    if (this.compressor) {
      this.droneGain.connect(this.compressor);
    }
  }

  private stopTanpuraDrone() {
    this.droneOscs.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore already stopped
      }
    });
    this.droneOscs = [];
  }

  /**
   * Synthesize a sacred temple bell / manjira chime
   */
  private playTempleBell(ctx: AudioContext, time: number, highPitch: boolean = false) {
    if (!this.compressor) return;

    const bellGain = ctx.createGain();
    bellGain.connect(this.compressor);

    const baseFreq = highPitch ? 1760 : 880; // A6 or A5
    bellGain.gain.setValueAtTime(0.001, time);
    bellGain.gain.linearRampToValueAtTime(highPitch ? 0.08 : 0.16, time + 0.01);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, time + (highPitch ? 0.8 : 2.5));

    // Metallic partials
    [baseFreq, baseFreq * 1.33, baseFreq * 2.0].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      osc.connect(bellGain);
      osc.start(time);
      osc.stop(time + (highPitch ? 0.8 : 2.5));
    });
  }

  /**
   * Synthesize a melodic Aarti voice note (warm flute / harmonium lead)
   */
  private playMelodicNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    durationSec: number
  ) {
    if (!this.compressor) return;

    const noteGain = ctx.createGain();
    noteGain.connect(this.compressor);

    // ADSR Envelope
    const attack = 0.06;
    const decay = 0.08;
    const sustain = 0.75;
    const release = 0.15;

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.24, startTime + attack);
    noteGain.gain.linearRampToValueAtTime(0.24 * sustain, startTime + attack + decay);
    noteGain.gain.setValueAtTime(0.24 * sustain, startTime + durationSec - release);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    // Warm Low-pass filter for natural acoustic body
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, startTime);
    filter.frequency.linearRampToValueAtTime(800, startTime + durationSec);

    // Dual oscillator: Triangle (body) + Sine (smooth overtone)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1 octave overtone
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.25, startTime);

    // Gentle devotional vibrato
    const vibrato = ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5.2, startTime); // 5.2 Hz human vocal vibrato
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(3.5, startTime);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);

    vibrato.start(startTime);
    vibrato.stop(startTime + durationSec);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(noteGain);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + durationSec);
    osc2.stop(startTime + durationSec);

    this.activeNoteNodes.push({
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          vibrato.stop();
        } catch (e) {}
      },
    });
  }

  /**
   * Schedule one complete cycle of the Aarti and loop continuously
   */
  private scheduleAartiCycle() {
    if (!this.isPlaying || !this.ctx) return;

    const ctx = this.ctx;
    let currentTimeOffset = ctx.currentTime + 0.1;

    // Ring starting temple bell
    this.playTempleBell(ctx, currentTimeOffset, false);

    let totalCycleDuration = 0;
    AARTI_SCORE.forEach(item => {
      totalCycleDuration += item.duration * this.tempoSecondsPerBeat;
    });

    let accumulatedBeats = 0;
    AARTI_SCORE.forEach((scoreItem, index) => {
      const noteDuration = scoreItem.duration * this.tempoSecondsPerBeat;
      const noteStartTime = currentTimeOffset + accumulatedBeats * this.tempoSecondsPerBeat;
      const freq = NOTES[scoreItem.note];

      // Play note
      if (freq) {
        this.playMelodicNote(ctx, freq, noteStartTime, noteDuration);
      }

      // Add gentle temple manjira cymbals on rhythm beats
      if (index % 2 === 0) {
        this.playTempleBell(ctx, noteStartTime, true);
      }

      // Schedule real-time lyric update
      const delayMs = Math.max(0, (noteStartTime - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (this.isPlaying && scoreItem.lyricMR !== '—') {
          this.notifyLyric(scoreItem.lyricMR, scoreItem.lyricEN);
        }
      }, delayMs);

      accumulatedBeats += scoreItem.duration;
    });

    // Schedule next loop cycle seamlessly
    const loopCycleMs = (totalCycleDuration - 0.2) * 1000;
    this.loopTimer = window.setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleAartiCycle();
      }
    }, loopCycleMs);
  }

  /**
   * Start 'Om Jai Ishwati Mata' Aarti
   */
  public playAarti() {
    const ctx = this.initContext();
    this.isPlaying = true;
    this.notifyStateChange();

    // Reset master gain to smooth fade-in
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.6);
    }

    // Start background Tanpura drone
    this.startTanpuraDrone(ctx);

    // Schedule melody
    this.scheduleAartiCycle();
  }

  /**
   * Silence audio smoothly
   */
  public silence() {
    this.isPlaying = false;
    this.notifyStateChange();

    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    if (this.ctx && this.masterGain) {
      // Smooth fade out over 400ms to avoid audio pops
      this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      setTimeout(() => {
        this.stopTanpuraDrone();
        this.activeNoteNodes.forEach(n => n.stop());
        this.activeNoteNodes = [];
      }, 450);
    } else {
      this.stopTanpuraDrone();
      this.activeNoteNodes = [];
    }

    this.notifyLyric('', '');
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public destroy() {
    this.silence();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Export singleton instance for app-wide clean audio management
export const aartiAudioEngine = new AartiAudioEngine();
