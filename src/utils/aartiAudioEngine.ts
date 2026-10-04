/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Musical notes frequencies in Hz (Raga Bhupali / Bilawal traditional devotional scale)
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

export interface AartiVerse {
  lineMR: string;
  lineEN: string;
  leadNotes: { note: string; duration: number }[];
}

// Authentic Traditional Marathi Aarti for Shree Ishwatichi Mata
export const MARATHI_AARTI_VERSES: AartiVerse[] = [
  // Dhrupad (Refrain)
  {
    lineMR: 'जय देवी जय देवी जय ईश्वटी माते',
    lineEN: 'Jai Devi Jai Devi Jai Ishwati Mate',
    leadNotes: [
      { note: 'G4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'E4', duration: 1.5 },
      { note: 'F4', duration: 0.5 },
      { note: 'G4', duration: 2.0 },
    ]
  },
  {
    lineMR: 'प्रसन्न होऊनि पावे भक्तांच्या हाके',
    lineEN: 'Prasanna Houni Pave Bhaktanchya Hake',
    leadNotes: [
      { note: 'C5', duration: 1.0 },
      { note: 'C5', duration: 1.0 },
      { note: 'B4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 1.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'G4', duration: 2.0 },
    ]
  },
  // Kadve 1
  {
    lineMR: 'स्वयंभू पाषाणी प्रगटली पावन मूर्ती',
    lineEN: 'Swayambhu Pashani Pragatali Pavan Murti',
    leadNotes: [
      { note: 'D5', duration: 1.0 },
      { note: 'D5', duration: 1.0 },
      { note: 'C5', duration: 1.0 },
      { note: 'B4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'F4', duration: 1.0 },
      { note: 'E4', duration: 1.0 },
    ]
  },
  {
    lineMR: 'भक्तजन धावती कराया तव आरती',
    lineEN: 'Bhaktajan Dhavati Karaya Tava Aarti',
    leadNotes: [
      { note: 'F4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'B4', duration: 1.0 },
      { note: 'C5', duration: 2.0 },
      { note: 'G4', duration: 2.0 },
    ]
  },
  // Kadve 2
  {
    lineMR: 'कष्ट निवारुनी देई सुख समृद्धी',
    lineEN: 'Kashta Nivaruni Deee Sukha Samruddhi',
    leadNotes: [
      { note: 'D5', duration: 1.0 },
      { note: 'D5', duration: 1.0 },
      { note: 'C5', duration: 1.0 },
      { note: 'B4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'F4', duration: 1.0 },
      { note: 'E4', duration: 1.0 },
    ]
  },
  {
    lineMR: 'हात जोडुनी चरणी नमितो आदिशक्ती',
    lineEN: 'Haat Joduni Charani Namito Aadishakti',
    leadNotes: [
      { note: 'F4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'B4', duration: 1.0 },
      { note: 'C5', duration: 2.0 },
      { note: 'G4', duration: 2.0 },
    ]
  },
  // Concluding Refrain
  {
    lineMR: 'जय देवी जय देवी जय ईश्वटी माते',
    lineEN: 'Jai Devi Jai Devi Jai Ishwati Mate',
    leadNotes: [
      { note: 'G4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 1.0 },
      { note: 'F4', duration: 1.0 },
      { note: 'E4', duration: 2.0 },
    ]
  },
  {
    lineMR: 'प्रसन्न होऊनि पावे भक्तांच्या हाके',
    lineEN: 'Prasanna Houni Pave Bhaktanchya Hake',
    leadNotes: [
      { note: 'C5', duration: 1.0 },
      { note: 'C5', duration: 1.0 },
      { note: 'B4', duration: 1.0 },
      { note: 'A4', duration: 1.0 },
      { note: 'G4', duration: 1.5 },
      { note: 'A4', duration: 0.5 },
      { note: 'G4', duration: 2.0 },
    ]
  }
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

  // Playback state
  private isPlaying: boolean = false;
  private currentVolume: number = 0.8;
  private loopTimer: number | null = null;
  private tempoSecondsPerBeat: number = 0.58; // Traditional devotional pacing (~103 BPM)
  private lyricListeners: Set<(mr: string, en: string) => void> = new Set();
  private stateListeners: Set<(playing: boolean) => void> = new Set();
  private activeNoteNodes: { stop: () => void }[] = [];

  private initContext(): AudioContext {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Compressor for acoustic warmth and dynamics
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

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
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, this.ctx.currentTime + 0.05);
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
   * Recite Marathi Aarti Verse exclusively with soothing devotional female vocal timbre
   */
  private speakMarathiVerse(verseMR: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!this.isPlaying) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(verseMR);
      const voices = window.speechSynthesis.getVoices();

      // Find authentic Marathi or Hindi female voice
      const femaleVoice = 
        voices.find(v => (v.lang.startsWith('mr') || v.lang.startsWith('hi')) && (
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('swara') || 
          v.name.toLowerCase().includes('kalpana') || 
          v.name.toLowerCase().includes('priya') ||
          v.name.toLowerCase().includes('zira')
        )) ||
        voices.find(v => v.lang.startsWith('mr')) ||
        voices.find(v => v.lang.startsWith('hi')) ||
        voices.find(v => v.name.toLowerCase().includes('female')) ||
        null;

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.lang = femaleVoice.lang || 'mr-IN';
      } else {
        utterance.lang = 'mr-IN';
      }
      utterance.pitch = 1.25; // Gentle sweet female pitch
      utterance.rate = 0.84;  // Sacred rhythmic Aarti cadence
      utterance.volume = Math.min(1, this.currentVolume * 1.1);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis voice notice:', e);
    }
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
      } catch (e) {}
    });
    this.droneOscs = [];
  }

  /**
   * Synthesize sacred manjira / melodic metallic resonance
   */
  private playSacredChime(ctx: AudioContext, time: number, highPitch: boolean = false) {
    if (!this.compressor) return;

    const chimeGain = ctx.createGain();
    chimeGain.connect(this.compressor);

    const baseFreq = highPitch ? 1760 : 880;
    chimeGain.gain.setValueAtTime(0.001, time);
    chimeGain.gain.linearRampToValueAtTime(highPitch ? 0.08 : 0.16, time + 0.01);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, time + (highPitch ? 0.8 : 2.5));

    // Metallic partials
    [baseFreq, baseFreq * 1.33, baseFreq * 2.0].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      osc.connect(chimeGain);
      osc.start(time);
      osc.stop(time + (highPitch ? 0.8 : 2.5));
    });
  }

  /**
   * Synthesize a melodic harmonium / vocal flute lead note
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

    const attack = 0.06;
    const decay = 0.08;
    const sustain = 0.75;
    const release = 0.15;

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.24, startTime + attack);
    noteGain.gain.linearRampToValueAtTime(0.24 * sustain, startTime + attack + decay);
    noteGain.gain.setValueAtTime(0.24 * sustain, startTime + durationSec - release);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    // Formant vocal filter for warm singing timbre
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, startTime);
    filter.frequency.linearRampToValueAtTime(750, startTime + durationSec);

    // Dual oscillator: Triangle + Sine
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.22, startTime);

    // Devotional singing vibrato (5.2 Hz)
    const vibrato = ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5.2, startTime);
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(3.2, startTime);
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
   * Schedule one complete cycle of the Marathi Aarti and loop continuously
   */
  private scheduleAartiCycle() {
    if (!this.isPlaying || !this.ctx) return;

    const ctx = this.ctx;
    let currentTimeOffset = ctx.currentTime + 0.1;

    // Start holy opening resonance
    this.playSacredChime(ctx, currentTimeOffset, false);

    let totalCycleDuration = 0;
    MARATHI_AARTI_VERSES.forEach(verse => {
      let verseDuration = 0;
      verse.leadNotes.forEach(n => {
        verseDuration += n.duration * this.tempoSecondsPerBeat;
      });
      totalCycleDuration += verseDuration;
    });

    let accumulatedBeats = 0;

    MARATHI_AARTI_VERSES.forEach((verse, verseIdx) => {
      const verseStartTime = currentTimeOffset + accumulatedBeats * this.tempoSecondsPerBeat;
      const delayMs = Math.max(0, (verseStartTime - ctx.currentTime) * 1000);

      // Trigger lyric display and vocal female speech synthesis at start of verse
      window.setTimeout(() => {
        if (this.isPlaying) {
          this.notifyLyric(verse.lineMR, verse.lineEN);
          this.speakMarathiVerse(verse.lineMR);
        }
      }, delayMs);

      // Schedule notes for this verse
      let verseBeatOffset = 0;
      verse.leadNotes.forEach((n, noteIdx) => {
        const noteDuration = n.duration * this.tempoSecondsPerBeat;
        const noteStartTime = verseStartTime + verseBeatOffset * this.tempoSecondsPerBeat;
        const freq = NOTES[n.note];

        if (freq) {
          this.playMelodicNote(ctx, freq, noteStartTime, noteDuration);
        }

        // Add manjira cymbals on rhythm beats
        if (noteIdx % 2 === 0) {
          this.playSacredChime(ctx, noteStartTime, true);
        }

        verseBeatOffset += n.duration;
      });

      accumulatedBeats += verseBeatOffset;
    });

    // Schedule next loop cycle seamlessly
    const loopCycleMs = (totalCycleDuration + 0.5) * 1000;
    this.loopTimer = window.setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleAartiCycle();
      }
    }, loopCycleMs);
  }

  /**
   * Start Marathi Aarti
   */
  public playAarti() {
    const ctx = this.initContext();
    this.isPlaying = true;
    this.notifyStateChange();

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, ctx.currentTime + 0.6);
    }

    // Start background Tanpura drone
    this.startTanpuraDrone(ctx);

    // Schedule Marathi Aarti with Female Voice and Harmonium
    this.scheduleAartiCycle();
  }

  /**
   * Silence audio smoothly
   */
  public silence() {
    this.isPlaying = false;
    this.notifyStateChange();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    if (this.ctx && this.masterGain) {
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
