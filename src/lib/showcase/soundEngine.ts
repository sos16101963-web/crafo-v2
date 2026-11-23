class SoundEngine {
  private ctx: AudioContext | null = null;
  private bus: AudioNode | null = null;
  private enabled = false;

  private humGain: GainNode | null = null;
  private humOsc1: OscillatorNode | null = null;
  private humOsc2: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;

  private ganacheGain: GainNode | null = null;
  private ganacheOsc1: OscillatorNode | null = null;
  private ganacheOsc2: OscillatorNode | null = null;
  private ganacheFilter: BiquadFilterNode | null = null;

  private lastSnapAt = 0;
  private lastScrubAt = 0;
  private lastLayerAt = 0;

  public isEnabled(): boolean {
    return this.enabled;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 18;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.16;

      const master = this.ctx.createGain();
      master.gain.value = 0.88;
      comp.connect(master);
      master.connect(this.ctx.destination);
      this.bus = comp;
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getDest(ctx: AudioContext): AudioNode {
    return this.bus ?? ctx.destination;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      const ctx = this.ensureContext();
      if (ctx) {
        this.initDrones(ctx);
        this.playWelcomeChord();
      }
    } else {
      this.muteAllDrones();
    }
    return this.enabled;
  }

  public enable(): boolean {
    if (this.enabled) return true;
    return this.toggle();
  }

  private initDrones(ctx: AudioContext): void {
    const dest = this.getDest(ctx);

    if (!this.humGain) {
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 190;
      filter.Q.value = 2.6;

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 60;

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 120.5;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start();
      osc2.start();

      this.humGain = gain;
      this.humOsc1 = osc1;
      this.humOsc2 = osc2;
      this.humFilter = filter;
    }

    if (!this.ganacheGain) {
      const gGain = ctx.createGain();
      gGain.gain.value = 0.0001;

      const gFilter = ctx.createBiquadFilter();
      gFilter.type = 'lowpass';
      gFilter.frequency.value = 280;
      gFilter.Q.value = 1.4;

      const g1 = ctx.createOscillator();
      g1.type = 'triangle';
      g1.frequency.value = 98.0;

      const g2 = ctx.createOscillator();
      g2.type = 'sine';
      g2.frequency.value = 146.83;

      g1.connect(gFilter);
      g2.connect(gFilter);
      gFilter.connect(gGain);
      gGain.connect(dest);

      g1.start();
      g2.start();

      this.ganacheGain = gGain;
      this.ganacheOsc1 = g1;
      this.ganacheOsc2 = g2;
      this.ganacheFilter = gFilter;
    }
  }

  public muteAllDrones(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.humGain) {
      this.humGain.gain.cancelScheduledValues(now);
      this.humGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
    if (this.ganacheGain) {
      this.ganacheGain.gain.cancelScheduledValues(now);
      this.ganacheGain.gain.setTargetAtTime(0.0001, now, 0.1);
    }
  }

  public playWelcomeChord(): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getDest(ctx);

    const freqs = [220, 277.18, 329.63, 440];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 3 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.045);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now + idx * 0.045);
      g.gain.linearRampToValueAtTime(0.085, now + idx * 0.045 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.72 + idx * 0.06);

      osc.connect(filter);
      filter.connect(g);
      g.connect(dest);
      osc.start(now + idx * 0.045);
      osc.stop(now + 0.88 + idx * 0.06);
    });
  }

  public setTemperHum(intensity: number, tempC: number): void {
    if (!this.enabled || !this.ctx || !this.humGain || !this.humOsc1 || !this.humOsc2 || !this.humFilter) {
      return;
    }
    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetGain = clamped > 0.02 ? 0.006 + clamped * 0.055 : 0.0001;
    const normTemp = Math.max(0, Math.min(1, (tempC - 18) / 27));
    const baseFreq = 56 + normTemp * 28;
    this.humOsc1.frequency.setTargetAtTime(baseFreq, now, 0.12);
    this.humOsc2.frequency.setTargetAtTime(baseFreq * 2.01, now, 0.12);
    this.humFilter.frequency.setTargetAtTime(160 + normTemp * 260, now, 0.12);
    this.humGain.gain.setTargetAtTime(targetGain, now, 0.12);
  }

  public setGanacheAmbience(intensity: number): void {
    if (!this.enabled || !this.ctx || !this.ganacheGain || !this.ganacheFilter || !this.ganacheOsc1 || !this.ganacheOsc2) {
      return;
    }
    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetGain = clamped > 0.02 ? 0.012 + clamped * 0.048 : 0.0001;
    this.ganacheFilter.frequency.setTargetAtTime(220 + clamped * 260, now, 0.18);
    this.ganacheOsc1.frequency.setTargetAtTime(98 + clamped * 6, now, 0.25);
    this.ganacheOsc2.frequency.setTargetAtTime(146.83 + clamped * 9, now, 0.25);
    this.ganacheGain.gain.setTargetAtTime(targetGain, now, 0.18);
  }

  public playSnap(reverse = false): void {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastSnapAt < 160) return;
    this.lastSnapAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getDest(ctx);

    if (!reverse) {
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.016));
      }

      [1850, 4200].forEach((freq, idx) => {
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(freq, now);
        bp.Q.value = idx === 0 ? 1.1 : 1.7;

        const g = ctx.createGain();
        g.gain.setValueAtTime(idx === 0 ? 0.42 : 0.56, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

        noise.connect(bp);
        bp.connect(g);
        g.connect(dest);
        noise.start(now);
      });

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(195, now);
      osc.frequency.exponentialRampToValueAtTime(44, now + 0.085);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.36, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(subGain);
      subGain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.095);

      [0.016, 0.032, 0.052, 0.078, 0.108].forEach((offset, idx) => {
        const shardOsc = ctx.createOscillator();
        shardOsc.type = 'sine';
        shardOsc.frequency.setValueAtTime(2200 + idx * 540, now + offset);
        shardOsc.frequency.exponentialRampToValueAtTime(980, now + offset + 0.028);

        const sg = ctx.createGain();
        sg.gain.setValueAtTime(0.09 - idx * 0.012, now + offset);
        sg.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.032);

        shardOsc.connect(sg);
        sg.connect(dest);
        shardOsc.start(now + offset);
        shardOsc.stop(now + offset + 0.036);
      });
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(1240, now + 0.16);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.002, now);
      g.gain.linearRampToValueAtTime(0.14, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(g);
      g.connect(dest);
      osc.start(now);
      osc.stop(now + 0.19);
    }
  }

  public playScrubCrumble(progress: number): void {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastScrubAt < 65) return;
    this.lastScrubAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getDest(ctx);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900 + progress * 900, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.022);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.028);
  }

  public playLayerLock(layerIdx: number): void {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastLayerAt < 110) return;
    this.lastLayerAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getDest(ctx);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480 + layerIdx * 62, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playScanTone(mode: 'xray' | 'thermal' | 'split'): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dest = this.getDest(ctx);

    const base = mode === 'xray' ? 880 : mode === 'thermal' ? 540 : 660;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.25, now + 0.07);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playTick(): void {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.016);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(g);
    g.connect(this.getDest(ctx));
    osc.start(now);
    osc.stop(now + 0.022);
  }
}

export const soundEngine = new SoundEngine();
