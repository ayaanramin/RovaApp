// Name: YouTube Operations
// ID: SPyoutubeoperations
// Description: Fetch and play Youtube videos and statistics in your project.
// By: SharkPool
// Contributed By: Nekl300
// Contributed By: Clickertale2 <https://github.com/Clickertale2>
// Modified: Added sync/control blocks for co-watch
// License: MIT

// Version V.1.8.02

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("YouTube Operations must run unsandboxed");

  const menuIconURI =
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDUuMzU4IiBoZWlnaHQ9IjE0NS4zNTgiIHZpZXdCb3g9IjAgMCAxNDUuMzU4IDE0NS4zNTgiPjxwYXRoIGQ9Ik0wIDcyLjY3OUMwIDMyLjUzOSAzMi41NCAwIDcyLjY3OSAwczcyLjY3OSAzMi41NCA3Mi42NzkgNzIuNjc5LTMyLjU0IDcyLjY3OS03Mi42NzkgNzIuNjc5UzAgMTEyLjgxOCAwIDcyLjY3OSIgZmlsbD0iI2MzMDAwMCIvPjxwYXRoIGQ9Ik05LjA0MSA3Mi42NzljMC0zNS4xNDYgMjguNDkyLTYzLjYzOCA2My42MzgtNjMuNjM4czYzLjYzOCAyOC40OTIgNjMuNjM4IDYzLjYzOC0yOC40OTIgNjMuNjM4LTYzLjYzOCA2My42MzhTOS4wNDEgMTA3LjgyNSA5LjA0MSA3Mi42NzkiIGZpbGw9InJlZCIvPjxwYXRoIGQ9Ik05OS40MTQgNzYuNjQxYy0xMC41ODYgNS44Ni0zMC4xIDE2LjY1OS0zNi4yODcgMjAuMDgzLTMuNjk1IDIuMDQ1LTcuOTEyIDEuMDM5LTcuOTEyLTMuOTEzdi0zOS4zN2MwLTQuMTg1IDMuNTI0LTcuMDU1IDYuNzctNS4yNThsMzcuNDI5IDIwLjcxNWM0LjIwNiAyLjMyOCA0LjIgNS40MTkgMCA3Ljc0MyIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";

  const blockIconURI =
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMy4yMDYiIGhlaWdodD0iMjUuMTk2IiB2aWV3Qm94PSIwIDAgMzMuMjA2IDI1LjE5NiI+PHBhdGggZD0iTTMzLjIwNiAxMi41OThzMCA1Ljg1OC0uNjk0IDguNjYzYy0uMzgzIDEuNTUtMS41MDcgMi43NjgtMi45MzYgMy4xODItMi41ODkuNzUzLTEyLjk3My43NTMtMTIuOTczLjc1M3MtMTAuMzg0IDAtMTIuOTczLS43NTNjLTEuNDMtLjQxNC0yLjU1My0xLjYzMi0yLjkzNi0zLjE4MkMwIDE4LjQ1NiAwIDEyLjU5OCAwIDEyLjU5OFMwIDYuNzQuNjk0IDMuOTM1QzEuMDc3IDIuMzg1IDIuMjAxIDEuMTY3IDMuNjMuNzUyIDYuMjE5IDAgMTYuNjAzIDAgMTYuNjAzIDBzMTAuMzg0IDAgMTIuOTczLjc1MmMxLjQzLjQxNSAyLjU1MyAxLjYzMyAyLjkzNiAzLjE4My42OTEgMi44MDUuNjk0IDguNjYzLjY5NCA4LjY2MyIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zMC44ODggMTIuNTk4czAgNC42NS0uNTk3IDYuODc3YTMuNTggMy41OCAwIDAgMS0yLjUyNiAyLjUyNmMtMi4yMjcuNTk3LTExLjE2Mi41OTctMTEuMTYyLjU5N3MtOC45MzUgMC0xMS4xNjItLjU5N2EzLjU4IDMuNTggMCAwIDEtMi41MjYtMi41MjZjLS41OTctMi4yMjctLjU5Ny02Ljg3Ny0uNTk3LTYuODc3czAtNC42NS41OTctNi44NzdhMy41OCAzLjU4IDAgMCAxIDIuNTI2LTIuNTI2YzIuMjI3LS41OTcgMTEuMTYyLS41OTcgMTEuMTYyLS41OTdzOC45MzUgMCAxMS4xNjIuNTk3YTMuNTggMy41OCAwIDAgMSAyLjUyNiAyLjUyNmMuNTk1IDIuMjI3LjU5NyA2Ljg3Ny41OTcgNi44NzciIGZpbGw9InJlZCIvPjxwYXRoIGQ9Im0xMy43NDMgOC4zMTMgNy40MjMgNC4yODUtNy40MjMgNC4yODV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+";

  const Cast = Scratch.Cast;
  const vm = Scratch.vm;
  const runtime = vm.runtime;

  const proxy = "https://api.codetabs.com/v1/proxy?quest=";

  const YTCache_ = new Map();

  const setCache = (id, value, omit_expiration) => {
    YTCache_.set(id, {
      expires: omit_expiration ? NaN : Date.now() + (180 * 1000),
      value: value
    });
  };

  const getCache = (id) => {
    if (YTCache_.has(id)) {
      const item = YTCache_.get(id);
      if (Date.now() > item.expires) { YTCache_.delete(id); }
      return item.value;
    }
    return null;
  };

  let PLAYER_MODE = "canvas";
  let canvasPlayer = null; // the div overlay container
  let ytPlayer     = null; // YT.Player instance
  let playerOptions = null; // last used options
  const ytWindows = [];

  // ── Player state ──────────────────────────────────────────────────────────
  let playerState = {
    currentTime: 0,
    duration:    0,
    state:       -1,
    videoId:     ""
  };

  // ── Load YouTube IFrame API ───────────────────────────────────────────────
  let ytApiReady = false;
  let ytApiLoading = false;
  let ytApiCallbacks = [];

  function loadYTApi() {
    return new Promise((resolve) => {
      if (ytApiReady) { resolve(); return; }
      ytApiCallbacks.push(resolve);
      if (ytApiLoading) return;
      ytApiLoading = true;

      window.onYouTubeIframeAPIReady = () => {
        ytApiReady = true;
        ytApiCallbacks.forEach(cb => cb());
        ytApiCallbacks = [];
      };

      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }

  // Poll player state every 250ms
  let pollInterval = null;
  function startPolling() {
    if (pollInterval) return;
    pollInterval = setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
      try {
        playerState.currentTime = ytPlayer.getCurrentTime() || 0;
        playerState.duration    = ytPlayer.getDuration()    || 0;
        playerState.state       = ytPlayer.getPlayerState() ?? -1;
        const data = ytPlayer.getVideoData?.();
        if (data?.video_id) playerState.videoId = data.video_id;
      } catch(e) {}
    }, 250);
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  async function createCanvasPlayer(videoId, options, startTime) {
    // Create overlay container div
    canvasPlayer = document.createElement("div");
    canvasPlayer.style.cssText = `width:${options.width}px;height:${options.height}px;position:absolute;transform:translate(${options.left}px,${options.top}px);pointer-events:auto;`;
    canvasPlayer._ytVidId = videoId;

    const playerDiv = document.createElement("div");
    playerDiv.id = "rova-yt-player-" + Date.now();
    canvasPlayer.appendChild(playerDiv);

    vm.renderer.addOverlay(canvasPlayer, "scale-centered");

    await loadYTApi();

    ytPlayer = new window.YT.Player(playerDiv.id, {
      width:  options.width,
      height: options.height,
      videoId,
      playerVars: {
        autoplay: 1,
        start:    Math.floor(startTime || 0),
        enablejsapi: 1
      },
      events: {
        onReady: () => { startPolling(); },
        onStateChange: (e) => { playerState.state = e.data; }
      }
    });
  }

  function updateCanvasPlayer(options) {
    if (!canvasPlayer) return;
    canvasPlayer.style.width     = options.width  + "px";
    canvasPlayer.style.height    = options.height + "px";
    canvasPlayer.style.transform = `translate(${options.left}px,${options.top}px)`;
    if (ytPlayer && typeof ytPlayer.setSize === 'function') {
      ytPlayer.setSize(options.width, options.height);
    }
  }

  function closeCanvasPlayer() {
    stopPolling();
    if (ytPlayer) {
      try { ytPlayer.destroy(); } catch(e) {}
      ytPlayer = null;
    }
    if (canvasPlayer) {
      vm.renderer.removeOverlay(canvasPlayer);
      canvasPlayer = null;
    }
    playerState = { currentTime:0, duration:0, state:-1, videoId:"" };
  }

  runtime.on("RUNTIME_DISPOSED", closeCanvasPlayer);
  runtime.on("PROJECT_STOP_ALL", closeCanvasPlayer);

  class YTOperationsSP {
    getInfo() {
      return {
        id: "SPyoutubeoperations",
        name: "YouTube Operations",
        menuIconURI,
        blockIconURI,
        color1: "#ff0000",
        color2: "#c10000",
        color3: "#820000",
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: "Videos" },
          {
            opcode: "extractVideoID",
            blockType: Scratch.BlockType.REPORTER,
            text: "extract video ID from [URL]",
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
            }
          },
          "---",
          {
            opcode: "fetchStats",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [STAT] count of video [VIDEO_ID]",
            arguments: {
              STAT: { type: Scratch.ArgumentType.STRING, menu: "STAT_OPTIONS" },
              VIDEO_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "dQw4w9WgXcQ" }
            }
          },
          {
            opcode: "fetchtitle",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [STAT] of video [VIDEO_ID]",
            arguments: {
              STAT: { type: Scratch.ArgumentType.STRING, menu: "STAT_OPTION" },
              VIDEO_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "dQw4w9WgXcQ" }
            }
          },
          {
            opcode: "vid2MP4",
            blockType: Scratch.BlockType.REPORTER,
            text: "video [VIDEO_ID] to [TYPE]",
            arguments: {
              VIDEO_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "dQw4w9WgXcQ" },
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "EXPORT_TYPES" }
            }
          },
          "---",
          {
            opcode: "getResults",
            blockType: Scratch.BlockType.REPORTER,
            text: "search for videos with query [QUERY]",
            arguments: {
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "SharkPool" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: "Users" },
          {
            opcode: "fetchUserThing",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [THING] from channel [URL]",
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://www.youtube.com/@SharkPool_SP" },
              THING: { type: Scratch.ArgumentType.STRING, menu: "USER_STUFF" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: "Video Player" },
          {
            opcode: "setPlayer",
            blockType: Scratch.BlockType.COMMAND,
            text: "play videos on [TYPE]",
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "DISPLAY" }
            }
          },
          {
            opcode: "openYouTubeLinkInNewWindow",
            blockType: Scratch.BlockType.COMMAND,
            text: "open video [ID] with width: [WIDTH] height: [HEIGHT] x: [LEFT] y: [TOP]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "dQw4w9WgXcQ" },
              WIDTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 480 },
              HEIGHT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
              LEFT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              TOP: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: "openYouTubeLinkInNewWindowAtTime",
            blockType: Scratch.BlockType.COMMAND,
            text: "open video [ID] with width: [WIDTH] height: [HEIGHT] x: [LEFT] y: [TOP] start from: [MINUTES]:[SECONDS]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "dQw4w9WgXcQ" },
              WIDTH: { type: Scratch.ArgumentType.NUMBER, defaultValue: 480 },
              HEIGHT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
              LEFT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              TOP: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              MINUTES: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SECONDS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 }
            }
          },
          {
            opcode: "closeYouTubeWindow",
            blockType: Scratch.BlockType.COMMAND,
            text: "close video [VIDEO_ID]",
            arguments: {
              VIDEO_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "dQw4w9WgXcQ" }
            }
          },
          "---",
          { blockType: Scratch.BlockType.LABEL, text: "Player Controls (for syncing)" },
          {
            opcode: "playerPlay",
            blockType: Scratch.BlockType.COMMAND,
            text: "player: play"
          },
          {
            opcode: "playerPause",
            blockType: Scratch.BlockType.COMMAND,
            text: "player: pause"
          },
          {
            opcode: "playerSeek",
            blockType: Scratch.BlockType.COMMAND,
            text: "player: seek to [SEC] seconds",
            arguments: {
              SEC: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: "playerSetVolume",
            blockType: Scratch.BlockType.COMMAND,
            text: "player: set volume to [VOL] %",
            arguments: {
              VOL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          "---",
          { blockType: Scratch.BlockType.LABEL, text: "Player Info (for syncing)" },
          {
            opcode: "playerCurrentTime",
            blockType: Scratch.BlockType.REPORTER,
            text: "player: current time (seconds)"
          },
          {
            opcode: "playerDuration",
            blockType: Scratch.BlockType.REPORTER,
            text: "player: total duration (seconds)"
          },
          {
            opcode: "playerProgress",
            blockType: Scratch.BlockType.REPORTER,
            text: "player: progress (0-100)"
          },
          {
            opcode: "playerState",
            blockType: Scratch.BlockType.REPORTER,
            text: "player: state"
          },
          {
            opcode: "playerIsPlaying",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "player: is playing?"
          },
          {
            opcode: "playerIsPaused",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "player: is paused?"
          },
          {
            opcode: "playerVideoId",
            blockType: Scratch.BlockType.REPORTER,
            text: "player: current video ID"
          },
          {
            opcode: "playerAspectRatio",
            blockType: Scratch.BlockType.REPORTER,
            text: "player: aspect ratio"
          },
          {
            opcode: "playerIsOpen",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "player: is open?"
          }
        ],
        menus: {
          DISPLAY: ["canvas", "window"],
          EXPORT_TYPES: ["mp4", "mp3"],
          STAT_OPTIONS: {
            acceptReporters: true,
            items: ["like", "dislike", "view", "rating"]
          },
          STAT_OPTION: {
            acceptReporters: true,
            items: [
              "title", "author", "author url",
              "thumbnail", "release date",
              "length", "raw length", "description"
            ]
          },
          USER_STUFF: {
            acceptReporters: true,
            items: [
              "profile", "name", "description", "location",
              "subscriber count", "video count",
              "total view count", "joined date"
            ]
          }
        },
      };
    }

    // ── All original helper/block funcs unchanged ─────────────────────────────
    async _fetch(url, cacheKey, type, omitProxy) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
      try {
        if (await Scratch.canFetch(url)) {
          if (!omitProxy) url = proxy + encodeURIComponent(url);
          const response = await Scratch.fetch(url);
          if (!response.ok) return null;
          const value = await (response[type])();
          if (cacheKey) setCache(cacheKey, value);
          return value;
        }
        return null;
      } catch(e) {
        console.warn("YouTube Error: " + e);
        return null;
      }
    }

    async extractVideoURI(vidDwnloadData) {
      if (!vidDwnloadData || !vidDwnloadData.downloadUrl) return "";
      const fileBlob = await this._fetch(vidDwnloadData.downloadUrl, false, "blob");
      if (!fileBlob) return "";
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror  = (e) => resolve("Failed:" + e);
        reader.readAsDataURL(fileBlob);
      });
    }

    extractVideoID(args) {
      const url = Cast.toString(args.URL);
      if (!url.includes("http")) return "Invalid URL";
      const urlObj = new URL(url);
      const path   = urlObj.pathname;
      if (url.includes("?v=") || url.includes("&v=")) {
        return urlObj.searchParams.get("v") || "Invalid URL";
      } else {
        return path.slice(path.lastIndexOf("/") + 1, path.length) || "Invalid URL";
      }
    }

    async fetchStats(args) {
      const id = Cast.toString(args.VIDEO_ID);
      const attribute = Cast.toString(args.STAT);
      const url = `https://returnyoutubedislikeapi.com/votes?videoId=${id}`;
      const jsonData = await this._fetch(url, "count" + id, "json", true);
      if (!jsonData) return "";
      switch (attribute) {
        case "like": return jsonData.likes;
        case "dislike": return jsonData.dislikes;
        case "rating": return jsonData.rating;
        case "view count":
        case "view": return jsonData.viewCount;
        case "release date":
        case "date created": return jsonData.dateCreated;
        default: return "";
      }
    }

    async fetchtitle(args) {
      const attribute = Cast.toString(args.STAT);
      if (attribute === "release date") return await this.fetchStats(args);
      const isSpecialAtt = (attribute === "description" || attribute === "length" || attribute === "raw length");
      const id = Cast.toString(args.VIDEO_ID);
      const url = isSpecialAtt ?
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=AIzaSyCyFg4jSNbDVzpHpvv73yZ89wpTFFeF_cY`
        : `https://www.youtube.com/oembed?url=http%3A//youtube.com/watch%3Fv%3D${id}&format=json`;
      const data = await this._fetch(url, "stat" + isSpecialAtt + id, "json", true);
      if (!data) return "";
      let match;
      switch (attribute) {
        case "author":      return data.author_name;
        case "author url":  return data.author_url;
        case "title":       return data.title;
        case "thumbnail":   return data.thumbnail_url;
        case "description": return (!data.items) ? "" : data.items[0]?.snippet?.description ?? "";
        case "raw length":
        case "length": {
          match = data.items?.[0]?.contentDetails?.duration;
          if (!match) return -1;
          const times = match.match(/(\d+)[HMS]/gi)?.map((t) => parseFloat(t));
          if (!times) return -1;
          let length = 0;
          if (attribute === "length") {
            length = "";
            if (times.length < 3) length = "00:";
            if (times.length < 2) length += "00:";
            length += times.map((t) => t.toString().padStart(2, "0")).join(":");
          } else {
            if (times.length >= 1) length += times[times.length - 1];
            if (times.length >= 2) length += times[times.length - 2] * 60;
            if (times.length >= 3) length += times[times.length - 3] * 3600;
          }
          return length;
        }
        default: return "";
      }
    }

    async vid2MP4(args) {
      const format   = args.TYPE === "mp4" ? "480" : "mp3";
      const cacheKey = format + args.VIDEO_ID;
      const url      = `https://dubs.io/wp-json/tools/v1/download-video?id=${args.VIDEO_ID}&format=${format}`;
      const cached   = getCache(cacheKey);
      if (cached) return cached;
      const initData = await this._fetch(url, cacheKey, "json", true);
      if (!initData || !initData.progressId) return "Failed to Fetch";
      const statusURL = `https://dubs.io/wp-json/tools/v1/status-video?id=${initData.progressId}`;
      return new Promise((resolve) => {
        let finished = false, attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const response = await Scratch.fetch(statusURL);
            if (!response.ok) { YTCache_.delete(cacheKey); throw new Error("Failed"); }
            const downloadData = await response.json();
            if (downloadData.status === "Finished") {
              finished = true;
              clearInterval(interval);
              if (downloadData?.downloadUrl) {
                const dataURL = await this.extractVideoURI(downloadData);
                if (dataURL) { setCache(cacheKey, dataURL, true); resolve(dataURL); return; }
              }
              YTCache_.delete(cacheKey);
              resolve("Failed to download video");
            }
          } catch {
            YTCache_.delete(cacheKey);
            clearInterval(interval);
            resolve("Failed to download video");
          }
          if (!finished && attempts >= maxAttempts) {
            YTCache_.delete(cacheKey);
            clearInterval(interval);
            resolve("Failed: Download timed out");
          }
        }, 3000);
      });
    }

    async fetchUserThing(args) {
      let id  = Cast.toString(args.URL);
      let url = id;
      const ytUrl = "https://www.youtube.com/";
      if (!id.startsWith("https://")) {
        if (id.includes("@")) url = ytUrl + id;
        else url = ytUrl + "channel/" + id;
      }
      url += "/about";
      const attribute = Cast.toString(args.THING);
      const text = await this._fetch(url, "profile" + id, "text");
      if (!text) return "";
      let match;
      switch (attribute) {
        case "profile": {
          match = text.match(/https:\/\/yt3\.googleusercontent\.com\/([a-zA-Z0-9_.+-=]+)/);
          return match?.[1] ? "https://yt3.googleusercontent.com/" + match[1] : "";
        }
        case "name": {
          match = text.match(/<meta\s+property="og:title"\s+content="([^"]+)">/);
          return match?.[1] ?? "";
        }
        case "description": {
          match = text.match(/"description":"((?:[^"\\]|\\.)*)"/);
          return match?.[1] ? match[1].replace(/\\n/g, "\n") : "";
        }
        case "subscriber count": {
          match = [...text.matchAll(/"metadataParts":\[\{"text":\{"content":"([^"]+)"/g)];
          if (match?.[1]) {
            const count = match[1][1].split(/\s+/);
            return count.length > 2 ? `${count[0]} ${count[1]}` : count[0];
          }
          return "";
        }
        case "video count": {
          match = text.match(/\},\{"text":\{"content":"(\d+)[^"]*","styleRuns":\[\{/);
          return match?.[1] ?? "";
        }
        case "total view count": {
          match = text.match(/viewCountText":"([\d\s,]+)[^"]*","joinedDateText"/);
          if (!match?.[1]) return "";
          return match[1].replaceAll(" ", "").replaceAll(" ", "").replace(",", "");
        }
        case "joined date": {
          match = text.match(/joinedDateText":{"content":"\w+\s([^"]*)/);
          return match?.[1] ? match[1].trim() : "";
        }
        case "location": {
          match = text.match(/"country":\{"simpleText":"([^"]+)"\}/);
          return match?.[1] ?? "Not Available";
        }
        default: return "Invalid Selection";
      }
    }

    async getResults(args) {
      const query = encodeURIComponent(Cast.toString(args.QUERY).replace(/ /g, "+"));
      const data  = await this._fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=15&type=video&key=AIzaSyCyFg4jSNbDVzpHpvv73yZ89wpTFFeF_cY`,
        "query", "json", true
      );
      if (!data) return "[]";
      return JSON.stringify((data?.items ?? []).map(item => ({
        videoId:     item.id.videoId,
        videoTitle:  item.snippet.title,
        channelId:   item.snippet.channelId,
        channelName: item.snippet.channelTitle
      })));
    }

    setPlayer(args) { PLAYER_MODE = args.TYPE; }

    openYouTubeLinkInNewWindow(args) { this.openYouTubeLinkInNewWindowAtTime(args); }
    openYouTubeLinkInNewWindowAtTime(args) {
      const id        = Cast.toString(args.ID);
      const minutes   = Cast.toNumber(args.MINUTES);
      const seconds   = Cast.toNumber(args.SECONDS);
      const startTime = minutes * 60 + seconds;
      const options   = {
        width:  Math.max(100, Cast.toNumber(args.WIDTH)),
        height: Math.max(100, Cast.toNumber(args.HEIGHT)),
        left:   Cast.toNumber(args.LEFT),
        top:    Cast.toNumber(args.TOP) * -1
      };
      options.left -= options.width  / 2;
      options.top  -= options.height / 2;

      if (PLAYER_MODE === "canvas") {
        if (canvasPlayer?._ytVidId === id) updateCanvasPlayer(options);
        else {
          closeCanvasPlayer();
          createCanvasPlayer(id, options, startTime);
          playerState.videoId = id;
        }
      } else {
        const legacyUrl = `https://www.yout-ube.com/watch?v=${id}&t=${startTime}&fullscreen=yes`;
        options.left += window.screen.width  / 2;
        options.top  += window.screen.height / 2;
        const params = Object.entries(options).map(e => e[0] + "=" + e[1]).join(",");
        const newWindow = window.open(legacyUrl, "_blank", params);
        if (newWindow) { ytWindows.push([id, newWindow]); newWindow.focus(); }
      }
    }

    closeYouTubeWindow(args) {
      const id = Cast.toString(args.VIDEO_ID);
      if (PLAYER_MODE === "canvas") closeCanvasPlayer();
      else {
        for (let i = ytWindows.length - 1; i >= 0; i--) {
          const item = ytWindows[i];
          if (item[1].closed) ytWindows.splice(i, 1);
          if (item[0] === id) { item[1]?.close(); ytWindows.splice(i, 1); }
        }
      }
    }

    // ── New sync/control blocks ───────────────────────────────────────────────
    playerPlay()   { if (ytPlayer?.playVideo)  ytPlayer.playVideo();  }
    playerPause()  { if (ytPlayer?.pauseVideo) ytPlayer.pauseVideo(); }

    playerSeek({ SEC }) {
      if (ytPlayer?.seekTo) ytPlayer.seekTo(Cast.toNumber(SEC), true);
    }

    playerSetVolume({ VOL }) {
      if (ytPlayer?.setVolume) ytPlayer.setVolume(Math.max(0, Math.min(100, Cast.toNumber(VOL))));
    }

    playerCurrentTime() { return Math.round(playerState.currentTime * 100) / 100; }
    playerDuration()    { return Math.round(playerState.duration    * 100) / 100; }

    playerProgress() {
      if (!playerState.duration) return 0;
      return Math.round((playerState.currentTime / playerState.duration) * 100 * 100) / 100;
    }

    playerState_() {
      const map = { "-1": "unstarted", "0": "ended", "1": "playing", "2": "paused", "3": "buffering", "5": "cued" };
      return map[String(playerState.state)] || "unknown";
    }

    playerIsPlaying() { return playerState.state === 1; }
    playerIsPaused()  { return playerState.state === 2; }
    playerVideoId()   { return playerState.videoId || (canvasPlayer?._ytVidId ?? ""); }
    playerIsOpen()    { return !!canvasPlayer; }

    playerAspectRatio() {
      if (!canvasPlayer) return "16:9";
      const w = parseFloat(canvasPlayer.style.width);
      const h = parseFloat(canvasPlayer.style.height);
      if (!w || !h) return "16:9";
      const gcd = (a, b) => b ? gcd(b, a % b) : a;
      const d = gcd(Math.round(w), Math.round(h));
      return `${Math.round(w/d)}:${Math.round(h/d)}`;
    }
  }

  // Fix opcode name clash
  YTOperationsSP.prototype.playerState = YTOperationsSP.prototype.playerState_;

  Scratch.extensions.register(new YTOperationsSP());
})(Scratch);
