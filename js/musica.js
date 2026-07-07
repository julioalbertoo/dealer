/* ============ TRAPICHEO — techno de fondo (Web Audio, sin samples) ============ */

const Musica = (() => {
  const BPM = 132;
  const PASO = 60 / BPM / 4;      // duración de una semicorchea
  const PASOS_COMPAS = 16;

  let ctx = null, master = null, ruido = null;
  let timer = null, paso = 0, tCuando = 0;
  let sonando = false;

  // línea de bajo acid: semitonos sobre La1, una nota por semicorchea
  const BAJO = [0, 0, 12, 0, 3, 0, 10, 12, 0, 0, 12, 3, 5, 3, 10, 15];
  const LA1 = 55;

  function crearRuido() {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function bombo(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.25);
  }

  function charles(t, abierto) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = ruido;
    f.type = 'highpass';
    f.frequency.value = 8000;
    const dur = abierto ? 0.12 : 0.04;
    g.gain.setValueAtTime(abierto ? 0.32 : 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  function bajo(t, semitono) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.value = LA1 * Math.pow(2, semitono / 12);
    f.type = 'lowpass';
    f.Q.value = 12;
    f.frequency.setValueAtTime(1400, t);
    f.frequency.exponentialRampToValueAtTime(220, t + PASO * 0.9);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + PASO * 0.95);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(t); o.stop(t + PASO);
  }

  function stab(t) {
    // acorde menor corto, muy al fondo
    [0, 3, 7].forEach(s => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square';
      o.frequency.value = 220 * Math.pow(2, s / 12);
      g.gain.setValueAtTime(0.045, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.18);
    });
  }

  function programarPaso(p, t) {
    const enCompas = p % PASOS_COMPAS;
    if (enCompas % 4 === 0) bombo(t);
    charles(t, enCompas % 4 === 2);           // charles abierto a contratiempo
    bajo(t, BAJO[enCompas]);
    if (p % (PASOS_COMPAS * 2) === PASOS_COMPAS - 2) stab(t);
  }

  function bucle() {
    while (tCuando < ctx.currentTime + 0.12) {
      programarPaso(paso, tCuando);
      paso++;
      tCuando += PASO;
    }
  }

  function encender() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.13;   // de fondo, que no tape el parque
      master.connect(ctx.destination);
      ruido = crearRuido();
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (!sonando) {
      sonando = true;
      paso = 0;
      tCuando = ctx.currentTime + 0.06;
      timer = setInterval(bucle, 30);
    }
  }

  function apagar() {
    if (!sonando) return;
    sonando = false;
    clearInterval(timer);
    timer = null;
    if (ctx) ctx.suspend();
  }

  return {
    activa: () => sonando,
    encender,
    apagar,
    alternar() { sonando ? apagar() : encender(); }
  };
})();
