// Name: SoundCloud API
// ID: SPsoundCloud
// Description: Fetch songs and statistics from SoundCloud.
// By: SharkPool (modified: auto client ID)
// License: MIT

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("SoundCloud API must be run unsandboxed");

  const Cast = Scratch.Cast;
  const vm = Scratch.vm;

  const proxy = "https://api.codetabs.com/v1/proxy?quest=";
  const SoundCloudAPI = "https://api-v2.soundcloud.com/";

  const cloudCache_ = new Map();
  const setCache = (id, value) => {
    cloudCache_.set(id, { expires: Date.now() + 180000, value });
  };
  const getCache = (id) => {
    if (cloudCache_.has(id)) {
      const item = cloudCache_.get(id);
      if (Date.now() > item.expires) { cloudCache_.delete(id); return null; }
      return item.value;
    }
    return null;
  };

  let clientID = "BecG5WJDDxYMffAfWcjJleNqrGyJyZhI";
  let fetchingClientID = false;
  let clientIDFetched = false;

  // ── Auto-extract client ID from SoundCloud's own website ──────────────────
  async function fetchFreshClientID() {
    if (fetchingClientID) return;
    fetchingClientID = true;
    try {
      // 1. Fetch SoundCloud homepage HTML through proxy
      const homeRes = await fetch(proxy + encodeURIComponent("https://soundcloud.com"));
      const html = await homeRes.text();

      // 2. Find script URLs — SoundCloud embeds client_id in its app JS files
      const scriptMatches = [...html.matchAll(/<script[^>]+src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)];

      // 3. Try each script until we find the client_id
      for (const match of scriptMatches.slice(-5)) {
        try {
          const jsRes = await fetch(proxy + encodeURIComponent(match[1]));
          const js = await jsRes.text();
          const idMatch = js.match(/client_id\s*:\s*"([a-zA-Z0-9]{32})"/);
          if (idMatch) {
            clientID = idMatch[1];
            clientIDFetched = true;
            fetchingClientID = false;
            return clientID;
          }
        } catch(e) {}
      }
    } catch(e) {}
    fetchingClientID = false;
    return clientID;
  }

  vm.runtime.on("PROJECT_START", () => { cloudCache_.clear(); });

  const genMenuItem = (text, value, opt_pathValue) => {
    const item = { text: Scratch.translate(text), value: value ?? text };
    if (opt_pathValue) item.path = opt_pathValue;
    return item;
  };

  const TRACK_ATTRIBUTES = [
    genMenuItem("name", null, "title"),
    genMenuItem("artist", null, ["user", "username"]),
    genMenuItem("artist ID", null, "user_id"),
    genMenuItem("description", null, "description"),
    genMenuItem("cover", null, "artwork_url"),
    genMenuItem("release date", null, "created_at"),
    genMenuItem("formatted duration", null, "duration"),
    genMenuItem("duration", null, "duration"),
    genMenuItem("downloadable", null, "downloadable"),
    genMenuItem("plays", null, "playback_count"),
    genMenuItem("likes", null, "likes_count"),
    genMenuItem("comment count", null, "comment_count"),
    genMenuItem("genre", null, "genre"),
    genMenuItem("url", null, "permalink_url")
  ];
  const ARTIST_ATTRIBUTES = [
    genMenuItem("username", null, "username"),
    genMenuItem("description", null, "description"),
    genMenuItem("profile picture", null, "avatar_url"),
    genMenuItem("join date", null, "created_at"),
    genMenuItem("track count", null, "track_count"),
    genMenuItem("follower count", null, "followers_count"),
    genMenuItem("following count", null, "followings_count"),
    genMenuItem("url", null, "permalink_url")
  ];
  const STRONG_ARTIST_ATTS = ["description", "created_at", "followings_count", "track_count"];

  class SPsoundCloud {
    getInfo() {
      return {
        id: "SPsoundCloud",
        name: "SoundCloud API",
        color1: "#ff2200",
        color2: "#db1b00",
        color3: "#c02300",
        blocks: [
          // ── Auto client ID ─────────────────────────────────────────────
          {
            opcode: "fetchFreshClientID",
            blockType: Scratch.BlockType.COMMAND,
            text: "fetch fresh client ID from SoundCloud"
          },
          {
            opcode: "clientIDReady",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "client ID ready?"
          },
          {
            opcode: "getClientID",
            blockType: Scratch.BlockType.REPORTER,
            text: "client ID"
          },
          "---",
          // ── Manual override ─────────────────────────────────────────────
          {
            opcode: "setClient",
            blockType: Scratch.BlockType.COMMAND,
            text: "set client ID to [ID]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: clientID }
            }
          },
          {
            opcode: "testClient",
            blockType: Scratch.BlockType.BOOLEAN,
            disableMonitor: true,
            text: "test client ID"
          },
          "---",
          {
            opcode: "extractID",
            blockType: Scratch.BlockType.REPORTER,
            text: "ID of [THING] from url [URL]",
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "IDS" },
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://soundcloud.com/" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: "Tracks" },
          {
            opcode: "getTrackAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [THING] from track ID [ID]",
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "TRACKS" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackMp3",
            blockType: Scratch.BlockType.REPORTER,
            text: "get mp3 of track ID [ID]",
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackComment",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [NUM2] offset [NUM1] of [TYPE] comments from track ID [ID]",
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "COMMENT" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "searchTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: "search for tracks using query [QUERY]",
            arguments: {
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Ancient Visions" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: "Artists" },
          {
            opcode: "getArtistAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [THING] from artist ID [ID]",
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "ARTISTS" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 }
            }
          },
          {
            opcode: "getFollowers",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [NUM2] offset [NUM1] of followers from artist ID [ID]",
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "getTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: "get [NUM2] offset [NUM1] of tracks from artist ID [ID]",
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "searchArtists",
            blockType: Scratch.BlockType.REPORTER,
            text: "search for artists using query [QUERY]",
            arguments: {
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Aliantos" }
            }
          }
        ],
        menus: {
          TRACKS:  { acceptReporters: true, items: TRACK_ATTRIBUTES },
          ARTISTS: { acceptReporters: true, items: ARTIST_ATTRIBUTES },
          IDS:     { acceptReporters: true, items: [genMenuItem("track"), genMenuItem("artist")] },
          COMMENT: { acceptReporters: true, items: [genMenuItem("new"), genMenuItem("old")] }
        }
      };
    }

    // ── Auto client ID ──────────────────────────────────────────────────────
    async fetchFreshClientID() {
      await fetchFreshClientID();
    }

    clientIDReady() { return clientIDFetched; }
    getClientID()   { return clientID; }
    setClient({ ID }) { clientID = Cast.toString(ID); }

    // ── Helpers ─────────────────────────────────────────────────────────────
    _getAttributeProp(type, value) {
      const menu = type === "artist" ? ARTIST_ATTRIBUTES : TRACK_ATTRIBUTES;
      value = Cast.toString(value);
      const item = menu.find(i => i.value === value);
      if (item) return item.path ? item : item.value;
      return null;
    }

    async _fetch(url, cacheKey) {
      const cached = getCache(cacheKey);
      if (cached) return cached;
      try {
        if (await Scratch.canFetch(url)) {
          const response = await fetch(proxy + encodeURIComponent(url));
          if (!response.ok) return null;
          const json = await response.json();
          if (cacheKey) setCache(cacheKey, json);
          return json;
        }
        return null;
      } catch(e) { return null; }
    }

    _formatDuration(milli) {
      let s = Math.floor(milli / 1000);
      return Math.floor(s/3600) + ":" + String(Math.floor((s%3600)/60)).padStart(2,"0") + ":" + String(s%60).padStart(2,"0");
    }

    _returnJSON(json) {
      return vm.extensionManager._loadedExtensions.has("SPjson") ? json : JSON.stringify(json);
    }

    _recursiveCache(collection) {
      if (!Array.isArray(collection)) return;
      for (const item of collection) {
        if (item.kind === "comment" || item.kind === "user") {
          setCache("A" + (item.user_id ?? item.id), item.user ?? item);
        } else {
          setCache("T" + item.id, item);
        }
      }
    }

    _cleanupCollection(type, collection) {
      return collection.map(item => {
        if (type === "comment") return { body: item.body, created_at: item.created_at, user_id: item.user_id };
        return item.id;
      });
    }

    async _getCollection(type, args) {
      const id     = Cast.toString(args.ID ?? args.QUERY);
      const offset = Math.max(0, Math.min(500, Cast.toNumber(args.NUM1)));
      const limit  = Math.max(1, Math.min(500, Cast.toNumber(args.NUM2)));

      let url = SoundCloudAPI;
      switch (type[0]) {
        case "comment": {
          const t = Cast.toString(args.TYPE) === "new" ? "newest" : "oldest";
          url += "tracks/" + id + "/comments?sort=" + t + "&threaded=1&"; break;
        }
        case "followers": url += "users/" + id + "/followers?"; break;
        case "tracks":    url += "users/" + id + "/tracks?representation=1&"; break;
        case "searchT":   url += "search/tracks?q=" + id + "&"; break;
        case "searchA":   url += "search/users?q="  + id + "&"; break;
      }
      url += "limit=" + limit + "&offset=" + offset + "&client_id=" + clientID;

      const response = await this._fetch(url, type[1] + id);
      if (response) {
        const collection = response.collection ?? [];
        this._recursiveCache(collection);
        return this._returnJSON(this._cleanupCollection(type[0], structuredClone(collection)));
      }
      return '["fetch failed"]';
    }

    async testClient() {
      const url = "https://api-auth.soundcloud.com/oauth/session?client_id=" + clientID;
      const response = await this._fetch(url, null);
      return response ? response.session !== undefined : false;
    }

    async extractID(args) {
      const type    = Cast.toString(args.THING) === "track" ? "T" : "A";
      const songUrl = Cast.toString(args.URL);
      if (songUrl === "https://soundcloud.com/") return "";
      const url = SoundCloudAPI + "resolve?url=" + encodeURIComponent(songUrl) + "&client_id=" + clientID;
      const response = await this._fetch(url, null);
      if (response) { setCache(type + response.id, response); return response.id ?? ""; }
      return "";
    }

    async getTrackAtt(args) {
      const attrib = this._getAttributeProp("track", Cast.toString(args.THING));
      if (!attrib) return "";
      const id  = Cast.toString(args.ID);
      const url = SoundCloudAPI + "tracks/soundcloud:tracks:" + id + "?client_id=" + clientID;
      const response = await this._fetch(url, "T" + id);
      if (response) {
        const artistCache = getCache("A" + response.user_id);
        if (!artistCache) setCache("A" + response.user_id, response.user);
        let value;
        if (Array.isArray(attrib.path)) {
          value = response;
          for (const p of attrib.path) value = value[p];
        } else {
          value = response[attrib.path];
        }
        if (attrib.value === "formatted duration") value = this._formatDuration(value);
        return value ?? "";
      }
      return "fetch failed";
    }

    async getTrackMp3(args) {
      const id  = Cast.toString(args.ID);
      const url = SoundCloudAPI + "tracks/soundcloud:tracks:" + id + "?client_id=" + clientID;
      const response = await this._fetch(url, "T" + id);
      if (response) {
        if (!response.downloadable) return "";
        const media = response.media?.transcodings ?? [];
        const mediaData = media.find(m => m.format.mime_type === "audio/mpeg" && m.format.protocol === "progressive");
        if (mediaData) {
          const mp3Links = await this._fetch(mediaData.url + "?client_id=" + clientID, "TS" + id);
          return mp3Links?.url ?? "";
        }
      }
      return "fetch failed";
    }

    async getTrackComment(args) { return await this._getCollection(["comment","C"], args); }
    async searchTracks(args)    { return await this._getCollection(["searchT","ST"], args); }

    async getArtistAtt(args) {
      const attrib = this._getAttributeProp("artist", Cast.toString(args.THING));
      if (!attrib) return "";
      const id  = Cast.toString(args.ID);
      const url = SoundCloudAPI + "users/soundcloud:users:" + id + "?client_id=" + clientID;
      const response = await this._fetch(url, "A" + id);
      if (response) {
        const value = response[attrib.path];
        if (!value && STRONG_ARTIST_ATTS.includes(attrib.path)) {
          cloudCache_.delete("A" + id);
          return await this.getArtistAtt(args);
        }
        return value ?? "";
      }
      return "fetch failed";
    }

    async getFollowers(args) { return await this._getCollection(["followers","AF"], args); }
    async getTracks(args)    { return await this._getCollection(["tracks","AT"], args); }
    async searchArtists(args){ return await this._getCollection(["searchA","SA"], args); }
  }

  Scratch.extensions.register(new SPsoundCloud());
})(Scratch);
