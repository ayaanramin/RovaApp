// Name: URL Playback
// ID: notSound
// Description: Play sounds from URLs. Previously called "Sound".
// License: MIT AND MPL-2.0

/* generated l10n code */Scratch.translate.setup({"de":{"_URL Playback":"URL-Wiedergabe"},"fi":{"_URL Playback":"URL-äänentoisto","_play sound from url: [path] until done":"soita ääni URL-osoitteesta: [path] loppuun ","_start sound from url: [path]":"soita ääni URL-osoitteesta: [path]"},"it":{"_URL Playback":"Riproduzione da URL","_play sound from url: [path] until done":"avvia riproduzione suono da url: [path] e attendi la fine","_start sound from url: [path]":"riproduci suono da url: [path]"},"ja":{"_URL Playback":"URL元の音声再生","_play sound from url: [path] until done":"終わるまでurl:[path]から音声を再生する","_start sound from url: [path]":"url:[path]から音声を再生開始"},"ko":{"_URL Playback":"URL 재생","_play sound from url: [path] until done":"URL에서 소리 재생하고 기다리기: [path]","_start sound from url: [path]":"URL에서 소리 재생하기: [path]"},"nb":{"_play sound from url: [path] until done":"spill lyd fra nettadresse: [path] til ferdig","_start sound from url: [path]":"start lyd fra url: [path]"},"nl":{"_play sound from url: [path] until done":"start geluid van URL: [path] en wacht","_start sound from url: [path]":"start geluid van URL: [path]"},"ru":{"_URL Playback":"Воспроизведение URL-адреса","_play sound from url: [path] until done":"играть звук из url: [path] до конца","_start sound from url: [path]":"включить звук из url: [path]"},"uk":{"_play sound from url: [path] until done":"відтворити звук з url; [path] до кінця","_start sound from url: [path]":"відтворити звук з url; [path]"},"zh-cn":{"_URL Playback":"URL 播放","_play sound from url: [path] until done":"播放URL[path]的声音直到结束","_start sound from url: [path]":"播放URL[path]的声音"}});/* end generated l10n code */((Scratch) => {
  "use strict";

  const audioEngine = Scratch.vm.runtime.audioEngine;

  // ── HLS.js support ───────────────────────────────────────────────────────────
  let hlsJsReady = false;

  function loadHlsJs() {
    return new Promise(resolve => {
      if (window.Hls) { hlsJsReady = true; resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
      s.onload = () => { hlsJsReady = true; resolve(); };
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  function isHLS(url) {
    return url.includes('.m3u8');
  }

  // ── Original helpers (unchanged) ─────────────────────────────────────────────
  const fetchAsArrayBufferWithTimeout = (url) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let timeout = setTimeout(() => { xhr.abort(); reject(new Error("Timed out")); }, 30000);
      xhr.onload = () => {
        clearTimeout(timeout);
        if (xhr.status === 200) resolve(xhr.response);
        else reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
      };
      xhr.onerror = () => { clearTimeout(timeout); reject(new Error(`Failed to request ${url}`)); };
      xhr.responseType = "arraybuffer";
      xhr.open("GET", url);
      xhr.send();
    });

  const soundPlayerCache = new Map();

  const decodeSoundPlayer = async (url) => {
    const cached = soundPlayerCache.get(url);
    if (cached) {
      if (cached.sound) return cached.sound;
      throw cached.error;
    }
    try {
      const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
      const soundPlayer = await audioEngine.decodeSoundPlayer({ data: { buffer: arrayBuffer } });
      soundPlayerCache.set(url, { sound: soundPlayer, error: null });
      return soundPlayer;
    } catch (e) {
      soundPlayerCache.set(url, { sound: null, error: e });
      throw e;
    }
  };

  const playWithAudioEngine = async (url, target) => {
    const soundBank = target.sprite.soundBank;
    let soundPlayer;
    try {
      const originalSoundPlayer = await decodeSoundPlayer(url);
      soundPlayer = originalSoundPlayer.take();
    } catch (e) {
      console.warn("Could not fetch audio; falling back to primitive approach", e);
      return false;
    }
    soundBank.addSoundPlayer(soundPlayer);
    await soundBank.playSound(target, soundPlayer.id);
    delete soundBank.soundPlayers[soundPlayer.id];
    soundBank.playerTargets.delete(soundPlayer.id);
    soundBank.soundEffects.delete(soundPlayer.id);
    return true;
  };

  const playWithAudioElement = (url, target) =>
    new Promise((resolve, reject) => {
      const mediaElement = new Audio(url);
      mediaElement.volume = target.volume / 100;
      mediaElement.onended = () => resolve();
      mediaElement.play().then(() => {}).catch((err) => reject(err));
    });

  const playSound = async (url, target) => {
    try {
      if (!(await Scratch.canFetch(url))) throw new Error(`Permission to fetch ${url} denied`);
      const success = await playWithAudioEngine(url, target);
      if (!success) return await playWithAudioElement(url, target);
    } catch (e) {
      console.warn(`All attempts to play ${url} failed`, e);
    }
  };

  // ── Tracked sound players ─────────────────────────────────────────────────────
  // Routes through Scratch's AudioContext so the visualizer picks it up via inputNode
  const players   = new Map();  // id -> { source, gainNode, startTime, offset, paused, rate, buf }
  const endedFlags = new Map(); // id -> boolean

  function getCtx() {
    return audioEngine.audioContext;
  }

  function getPlayer(id) {
    return players.get(String(id)) || null;
  }

  function stopPlayer(id) {
    const p = players.get(id);
    if (!p) return;
    try { p.source.stop(); } catch(e) {}
    try { p.gainNode.disconnect(); } catch(e) {}
  }

  async function createPlayer(url, id) {
    const existing = players.get(id);
    if (existing) {
      existing.pause();
      if (existing._hls) { try { existing._hls.destroy(); } catch(e) {} }
      existing.src = "";
    }
    const audio = new Audio();
    audio.preservesPitch = true;
    audio.webkitPreservesPitch = true;
    endedFlags.set(id, false);
    audio.addEventListener("ended", () => endedFlags.set(id, true));

    if (isHLS(url)) {
      await loadHlsJs();
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ maxBufferLength: 30, enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(audio);
        audio._hls = hls;
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = url;
      }
    } else {
      audio.src = url;
    }

    players.set(id, audio);
    return audio;
  }

  async function loadBuffer(url) {
    const ab = await fetchAsArrayBufferWithTimeout(url);
    return getCtx().decodeAudioData(ab);
  }

  function startBuffer(id, buf, offsetSecs, rate, volume, loop) {
    const ctx      = getCtx();
    const gainNode = ctx.createGain();
    gainNode.gain.value = Math.max(0, Math.min(1, volume));
    // Connect to Scratch's inputNode so it flows through the visualizer
    gainNode.connect(audioEngine.inputNode);   // for visualizer
    gainNode.connect(ctx.destination);           // for actual playback

    const source       = ctx.createBufferSource();
    source.buffer      = buf;
    source.playbackRate.value  = rate;
    source.preservesPitch      = true;
    source.loop                = loop;
    source.connect(gainNode);

    source.onended = () => {
      if (!players.get(id)?.paused) endedFlags.set(id, true);
    };

    source.start(0, offsetSecs);

    players.set(id, {
      source,
      gainNode,
      startTime: ctx.currentTime - offsetSecs,
      offset: offsetSecs,
      paused: false,
      rate,
      buf,
      loop,
      volume: gainNode.gain.value
    });
  }

  class Sound {
    getInfo() {
      return {
        id: "notSound",
        name: Scratch.translate("URL Playback"),
        color1: "#cf63cf",
        menuIconURI: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUyIiBoZWlnaHQ9IjE1MiIgdmlld0JveD0iMCAwIDE1MiAxNTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF84MV8xMykiPgo8Y2lyY2xlIGN4PSI3NiIgY3k9Ijc2IiByPSI3NiIgZmlsbD0iI0ExMkRBMSIvPgo8Y2lyY2xlIGN4PSI3NiIgY3k9Ijc2IiByPSI3My41IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIgc3Ryb2tlLXdpZHRoPSI1Ii8+PHBhdGggZD0iTTc2IDIyQzQ2LjcgMjIgMjIgNDYuNyAyMiA3NkMyMiAxMDUuMyA0Ni43IDEzMCA3NiAxMzBDMTA1LjMgMTMwIDEzMCAxMDUuMyAxMzAgNzZDMTMwIDQ2LjcgMTA1LjMgMjIgNzYgMjJaIiBmaWxsPSIjQjA1NEIwIi8+PC9nPjxkZWZzPjxjbGlwUGF0aCBpZD0iY2xpcDBfODFfMTMiPjxyZWN0IHdpZHRoPSIxNTIiIGhlaWdodD0iMTUyIiBmaWxsPSJ3aGl0ZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPgo=",
        blocks: [
          // ── Original blocks (unchanged) ──────────────────────────────────
          {
            opcode: "play",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("start sound from url: [path]"),
            arguments: {
              path: { type: Scratch.ArgumentType.STRING, defaultValue: "https://extensions.turbowarp.org/meow.mp3" }
            }
          },
          {
            opcode: "playUntilDone",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("play sound from url: [path] until done"),
            arguments: {
              path: { type: Scratch.ArgumentType.STRING, defaultValue: "https://extensions.turbowarp.org/meow.mp3" }
            }
          },
          "---",
          // ── Tracked sounds ────────────────────────────────────────────────
          {
            opcode: "playAs",
            blockType: Scratch.BlockType.COMMAND,
            text: "start sound from url [PATH] with id [ID]",
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "https://extensions.turbowarp.org/meow.mp3" },
              ID:   { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" }
            }
          },
          {
            opcode: "playAsUntilDone",
            blockType: Scratch.BlockType.COMMAND,
            text: "play sound from url [PATH] with id [ID] until done",
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "https://extensions.turbowarp.org/meow.mp3" },
              ID:   { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" }
            }
          },
          "---",
          // ── Controls ──────────────────────────────────────────────────────
          {
            opcode: "pauseSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "pause sound [ID]",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "resumeSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "resume sound [ID]",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "stopSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop sound [ID]",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "stopAllSounds",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop all tracked sounds"
          },
          "---",
          // ── Seeking ───────────────────────────────────────────────────────
          {
            opcode: "rewindSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "rewind sound [ID] to beginning",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "seekSound",
            blockType: Scratch.BlockType.COMMAND,
            text: "seek sound [ID] to [SEC] seconds",
            arguments: {
              ID:  { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" },
              SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          "---",
          // ── Volume ────────────────────────────────────────────────────────
          {
            opcode: "setVolume",
            blockType: Scratch.BlockType.COMMAND,
            text: "set volume of sound [ID] to [VOL] %",
            arguments: {
              ID:  { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" },
              VOL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          {
            opcode: "getVolume",
            blockType: Scratch.BlockType.REPORTER,
            text: "volume of sound [ID]",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          "---",
          // ── Speed (pitch preserved) ───────────────────────────────────────
          {
            opcode: "setSpeed",
            blockType: Scratch.BlockType.COMMAND,
            text: "set speed of sound [ID] to [SPEED] (pitch preserved)",
            arguments: {
              ID:    { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" },
              SPEED: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: "getSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: "speed of sound [ID]",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          "---",
          // ── Looping ───────────────────────────────────────────────────────
          {
            opcode: "setLoop",
            blockType: Scratch.BlockType.COMMAND,
            text: "set sound [ID] looping [LOOP]",
            arguments: {
              ID:   { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" },
              LOOP: { type: Scratch.ArgumentType.STRING, menu: "loopMenu" }
            }
          },
          "---",
          // ── Info reporters ────────────────────────────────────────────────
          {
            opcode: "isPlaying",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "sound [ID] is playing?",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "isPaused",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "sound [ID] is paused?",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "currentTime",
            blockType: Scratch.BlockType.REPORTER,
            text: "current time of sound [ID] (seconds)",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "duration",
            blockType: Scratch.BlockType.REPORTER,
            text: "duration of sound [ID] (seconds)",
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          },
          {
            opcode: "whenSoundEnds",
            blockType: Scratch.BlockType.HAT,
            text: "when sound [ID] ends",
            isEdgeActivated: false,
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: "sound1" } }
          }
        ],
        menus: {
          loopMenu: { acceptReporters: false, items: ["on", "off"] }
        }
      };
    }

    // ── Original blocks (unchanged) ───────────────────────────────────────────
    play({ path }, util)         { playSound(path, util.target); }
    playUntilDone({ path }, util){ return playSound(path, util.target); }

    // ── Tracked sounds ────────────────────────────────────────────────────────
    async playAs({ PATH, ID }, util) {
      const url = Scratch.Cast.toString(PATH);
      const id  = Scratch.Cast.toString(ID);
      if (!(await Scratch.canFetch(url))) return;

      if (isHLS(url)) {
        const audio = await createPlayer(url, id);
        audio.volume = Math.max(0, Math.min(1, util.target.volume / 100));
        try {
          const ctx = audioEngine.audioContext;
          if (!audio._routed) {
            const src = ctx.createMediaElementSource(audio);
            src.connect(audioEngine.inputNode);
            audio._routed = true;
          }
        } catch(e) {}
        audio.play().catch(() => {});
      } else {
        stopPlayer(id);
        endedFlags.set(id, false);
        try {
          const buf = await loadBuffer(url);
          const vol = util.target.volume / 100;
          const p   = players.get(id);
          startBuffer(id, buf, 0, p?.rate || 1, vol, p?.loop || false);
        } catch(e) { console.warn("playAs failed", e); }
      }
    }

    async playAsUntilDone({ PATH, ID }, util) {
      const url = Scratch.Cast.toString(PATH);
      const id  = Scratch.Cast.toString(ID);
      if (!(await Scratch.canFetch(url))) return;

      if (isHLS(url)) {
        const audio = await createPlayer(url, id);
        audio.volume = Math.max(0, Math.min(1, util.target.volume / 100));
        try {
          const ctx = audioEngine.audioContext;
          if (!audio._routed) {
            const src = ctx.createMediaElementSource(audio);
            src.connect(audioEngine.inputNode);
            audio._routed = true;
          }
        } catch(e) {}
        await new Promise(resolve => { audio.onended = resolve; audio.play().catch(resolve); });
      } else {
        stopPlayer(id);
        endedFlags.set(id, false);
        try {
          const buf = await loadBuffer(url);
          const vol = util.target.volume / 100;
          const p   = players.get(id);
          await new Promise(resolve => {
            startBuffer(id, buf, 0, p?.rate || 1, vol, false);
            players.get(id).source.onended = resolve;
          });
        } catch(e) { console.warn("playAsUntilDone failed", e); }
      }
    }

    // ── Controls ──────────────────────────────────────────────────────────────
    pauseSound({ ID }) {
      const id = String(ID);
      const p  = getPlayer(id);
      if (!p || p.paused) return;
      const elapsed = getCtx().currentTime - p.startTime;
      p.offset = elapsed * p.rate;
      p.paused = true;
      try { p.source.stop(); } catch(e) {}
    }

    resumeSound({ ID }) {
      const id = String(ID);
      const p  = getPlayer(id);
      if (!p || !p.paused) return;
      startBuffer(id, p.buf, p.offset / p.rate, p.rate, p.volume, p.loop);
    }

    stopSound({ ID }) {
      const id = String(ID);
      stopPlayer(id);
      players.delete(id);
    }

    stopAllSounds() {
      players.forEach((_, id) => stopPlayer(id));
      players.clear();
    }

    // ── Seeking ───────────────────────────────────────────────────────────────
    rewindSound({ ID }) {
      const id = String(ID);
      const p  = getPlayer(id);
      if (!p) return;
      const wasPlaying = !p.paused;
      stopPlayer(id);
      startBuffer(id, p.buf, 0, p.rate, p.volume, p.loop);
      if (!wasPlaying) { players.get(id).paused = true; try { players.get(id).source.stop(); } catch(e) {} }
    }

    seekSound({ ID, SEC }) {
      const id  = String(ID);
      const p   = getPlayer(id);
      if (!p) return;
      const sec = Math.max(0, Scratch.Cast.toNumber(SEC));
      const wasPlaying = !p.paused;
      stopPlayer(id);
      startBuffer(id, p.buf, sec, p.rate, p.volume, p.loop);
      if (!wasPlaying) { players.get(id).paused = true; try { players.get(id).source.stop(); } catch(e) {} }
    }

    // ── Volume ────────────────────────────────────────────────────────────────
    setVolume({ ID, VOL }) {
      const p = getPlayer(ID);
      if (!p) return;
      p.volume = Math.max(0, Math.min(1, Scratch.Cast.toNumber(VOL) / 100));
      p.gainNode.gain.value = p.volume;
    }
    getVolume({ ID }) { const p = getPlayer(ID); return p ? Math.round(p.volume * 100) : 0; }

    // ── Speed (pitch preserved) ───────────────────────────────────────────────
    setSpeed({ ID, SPEED }) {
      const id   = String(ID);
      const p    = getPlayer(id);
      if (!p) return;
      const rate = Math.max(0.1, Math.min(16, Scratch.Cast.toNumber(SPEED)));
      // Restart with new rate from current position
      const elapsed = p.paused ? p.offset / p.rate : (getCtx().currentTime - p.startTime);
      const wasPaused = p.paused;
      stopPlayer(id);
      startBuffer(id, p.buf, elapsed, rate, p.volume, p.loop);
      if (wasPaused) { players.get(id).paused = true; try { players.get(id).source.stop(); } catch(e) {} }
    }
    getSpeed({ ID }) { const p = getPlayer(ID); return p ? p.rate : 1; }

    // ── Looping ───────────────────────────────────────────────────────────────
    setLoop({ ID, LOOP }) {
      const p = getPlayer(ID);
      if (!p) return;
      p.loop = Scratch.Cast.toString(LOOP) === "on";
      p.source.loop = p.loop;
    }

    // ── Info ──────────────────────────────────────────────────────────────────
    isPlaying({ ID }) { const p = getPlayer(ID); return !!(p && !p.paused); }
    isPaused({ ID })  { const p = getPlayer(ID); return !!(p && p.paused); }
    currentTime({ ID }) {
      const p = getPlayer(ID);
      if (!p) return 0;
      const t = p.paused ? p.offset / p.rate : getCtx().currentTime - p.startTime;
      return Math.round(Math.max(0, t) * 100) / 100;
    }
    duration({ ID }) {
      const p = getPlayer(ID);
      return p && p.buf ? Math.round(p.buf.duration * 100) / 100 : 0;
    }

    whenSoundEnds({ ID }) {
      const id = Scratch.Cast.toString(ID);
      if (endedFlags.get(id)) { endedFlags.set(id, false); return true; }
      return false;
    }
  }

  Scratch.extensions.register(new Sound());
})(Scratch);