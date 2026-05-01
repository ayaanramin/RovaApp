(function () {
  // ─── Firebase config ───────────────────────────────────────────────────────
  let DATABASE_URL = "https://rovaapp2026-default-rtdb.firebaseio.com";

  // ─── Internal state ────────────────────────────────────────────────────────
  let listeners = {};       // path -> EventSource
  let latestValues = {};    // path -> latest value string
  let changedPaths = [];    // paths that fired since last check
  let lastValues = {};      // for change detection via polling

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function buildURL(path) {
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${DATABASE_URL}/${encodePath(clean)}.json`;
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash.toString(16);
  }

  async function saltHash(password) {
    const salt = "rova_salt_2026";
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // ─── Real-time listener via SSE ────────────────────────────────────────────
  function startListener(path) {
    if (listeners[path]) return; // already listening
    const url = buildURL(path);
    const es = new EventSource(url + "?alt=sse");
    es.addEventListener("put", (e) => {
      try {
        const data = JSON.parse(e.data);
        const val = data.data;
        const strVal = val === null ? "" : (typeof val === "object" ? JSON.stringify(val) : String(val));
        if (latestValues[path] !== strVal) {
          latestValues[path] = strVal;
          if (!changedPaths.includes(path)) changedPaths.push(path);
        }
      } catch (err) {}
    });
    es.addEventListener("patch", (e) => {
      try {
        const data = JSON.parse(e.data);
        const val = data.data;
        const strVal = val === null ? "" : (typeof val === "object" ? JSON.stringify(val) : String(val));
        latestValues[path] = strVal;
        if (!changedPaths.includes(path)) changedPaths.push(path);
      } catch (err) {}
    });
    listeners[path] = es;
  }

  function stopListener(path) {
    if (listeners[path]) {
      listeners[path].close();
      delete listeners[path];
      delete latestValues[path];
    }
  }

  // ─── Extension class ───────────────────────────────────────────────────────
  class RovaFirebase {
    getInfo() {
      return {
        id: "rovafirebase",
        name: "Rova Firebase",
        color1: "#FF6D00",
        color2: "#E65100",
        blocks: [
          // ── Connection ──────────────────────────────────────────────────────
          {
            opcode: "setDatabaseURL",
            blockType: Scratch.BlockType.COMMAND,
            text: "set database url to [URL]",
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https://rovaapp2026-default-rtdb.firebaseio.com" }
            }
          },
          {
            opcode: "setDatabaseURLDefault",
            blockType: Scratch.BlockType.COMMAND,
            text: "set database url to Default"
          },
          {
            opcode: "getDatabaseURL",
            blockType: Scratch.BlockType.REPORTER,
            text: "database url"
          },
          {
            opcode: "isConnected",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "connected to database?"
          },
          "---",
          // ── Basic get/set ───────────────────────────────────────────────────
          {
            opcode: "setKey",
            blockType: Scratch.BlockType.COMMAND,
            text: "set key [KEY] to value [VALUE]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" }
            }
          },
          {
            opcode: "getKey",
            blockType: Scratch.BlockType.REPORTER,
            text: "get key [KEY]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" }
            }
          },
          {
            opcode: "deleteKey",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete key [KEY]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" }
            }
          },
          "---",
          // ── Password blocks ─────────────────────────────────────────────────
          {
            opcode: "setKeyWithPassword",
            blockType: Scratch.BlockType.COMMAND,
            text: "set key [KEY] to value [VALUE] with password [PASS]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" },
              PASS: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
            }
          },
          {
            opcode: "getKeyWithPassword",
            blockType: Scratch.BlockType.REPORTER,
            text: "get key [KEY] with password [PASS]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" },
              PASS: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
            }
          },
          {
            opcode: "checkPassword",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "check if password [PASS] is valid for key [KEY]",
            arguments: {
              PASS: { type: Scratch.ArgumentType.STRING, defaultValue: "password" },
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" }
            }
          },
          "---",
          // ── Viewable keys with password ─────────────────────────────────────
          {
            opcode: "setViewableKey",
            blockType: Scratch.BlockType.COMMAND,
            text: "set viewable key [KEY] to value [VALUE] with password [PASS]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" },
              PASS: { type: Scratch.ArgumentType.STRING, defaultValue: "password" }
            }
          },
          {
            opcode: "getViewableKey",
            blockType: Scratch.BlockType.REPORTER,
            text: "get viewable key [KEY]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "path/key" }
            }
          },
          "---",
          // ── Real-time listeners ─────────────────────────────────────────────
          {
            opcode: "listenToPath",
            blockType: Scratch.BlockType.COMMAND,
            text: "listen to [PATH] for changes",
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "messages/room1" }
            }
          },
          {
            opcode: "stopListening",
            blockType: Scratch.BlockType.COMMAND,
            text: "stop listening to [PATH]",
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "messages/room1" }
            }
          },
          {
            opcode: "whenPathChanges",
            blockType: Scratch.BlockType.HAT,
            text: "when [PATH] changes",
            isEdgeActivated: false,
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "messages/room1" }
            }
          },
          {
            opcode: "getLatestValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "latest value of [PATH]",
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "messages/room1" }
            }
          },
          {
            opcode: "pathChanged",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "did [PATH] just change?",
            arguments: {
              PATH: { type: Scratch.ArgumentType.STRING, defaultValue: "messages/room1" }
            }
          },
          "---",
          // ── Messaging helpers ───────────────────────────────────────────────
          {
            opcode: "sendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "send message [MSG] as [USER] to room [ROOM]",
            arguments: {
              MSG: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello!" },
              USER: { type: Scratch.ArgumentType.STRING, defaultValue: "Player1" },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: "room1" }
            }
          },
          {
            opcode: "getMessages",
            blockType: Scratch.BlockType.REPORTER,
            text: "get messages from room [ROOM]",
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: "room1" }
            }
          },
          {
            opcode: "listenToRoom",
            blockType: Scratch.BlockType.COMMAND,
            text: "listen to room [ROOM] for new messages",
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: "room1" }
            }
          },
          {
            opcode: "whenNewMessage",
            blockType: Scratch.BlockType.HAT,
            text: "when new message in room [ROOM]",
            isEdgeActivated: false,
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: "room1" }
            }
          },
          {
            opcode: "getTimestamp",
            blockType: Scratch.BlockType.REPORTER,
            text: "current timestamp"
          }
        ]
      };
    }

    // ── Connection ────────────────────────────────────────────────────────────
    setDatabaseURL({ URL }) {
      DATABASE_URL = URL.replace(/\/$/, "");
    }

    setDatabaseURLDefault() {
      DATABASE_URL = "https://rovaapp2026-default-rtdb.firebaseio.com";
    }

    getDatabaseURL() {
      return DATABASE_URL;
    }

    async isConnected() {
      try {
        const res = await fetch(`${DATABASE_URL}/.json?shallow=true`, { method: "GET" });
        return res.ok;
      } catch (e) {
        return false;
      }
    }

    // ── Basic get/set ─────────────────────────────────────────────────────────
    async setKey({ KEY, VALUE }) {
      try {
        await fetch(buildURL(KEY), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(VALUE)
        });
      } catch (e) {}
    }

    async getKey({ KEY }) {
      try {
        const res = await fetch(buildURL(KEY));
        const data = await res.json();
        if (data === null) return "";
        if (typeof data === "object") return JSON.stringify(data);
        return String(data);
      } catch (e) {
        return "";
      }
    }

    async deleteKey({ KEY }) {
      try {
        await fetch(buildURL(KEY), { method: "DELETE" });
      } catch (e) {}
    }

    // ── Password blocks ───────────────────────────────────────────────────────
    async setKeyWithPassword({ KEY, VALUE, PASS }) {
      try {
        const hash = await saltHash(PASS);
        const payload = { _value: VALUE, _hash: hash };
        await fetch(buildURL(KEY), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
    }

    async getKeyWithPassword({ KEY, PASS }) {
      try {
        const res = await fetch(buildURL(KEY));
        const data = await res.json();
        if (!data || typeof data !== "object") return "";
        const hash = await saltHash(PASS);
        if (data._hash !== hash) return "";
        return String(data._value ?? "");
      } catch (e) {
        return "";
      }
    }

    async checkPassword({ PASS, KEY }) {
      try {
        const res = await fetch(buildURL(KEY));
        const data = await res.json();
        if (!data || typeof data !== "object") return false;
        const hash = await saltHash(PASS);
        return data._hash === hash;
      } catch (e) {
        return false;
      }
    }

    // ── Viewable keys ─────────────────────────────────────────────────────────
    async setViewableKey({ KEY, VALUE, PASS }) {
      try {
        const hash = await saltHash(PASS);
        const payload = { _value: VALUE, _hash: hash, _public: true };
        await fetch(buildURL(KEY), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
    }

    async getViewableKey({ KEY }) {
      try {
        const res = await fetch(buildURL(KEY));
        const data = await res.json();
        if (!data || typeof data !== "object") return "";
        if (!data._public) return "";
        return String(data._value ?? "");
      } catch (e) {
        return "";
      }
    }

    // ── Real-time listeners ───────────────────────────────────────────────────
    listenToPath({ PATH }) {
      startListener(PATH);
    }

    stopListening({ PATH }) {
      stopListener(PATH);
    }

    whenPathChanges({ PATH }) {
      if (changedPaths.includes(PATH)) {
        changedPaths = changedPaths.filter(p => p !== PATH);
        return true;
      }
      return false;
    }

    getLatestValue({ PATH }) {
      return latestValues[PATH] ?? "";
    }

    pathChanged({ PATH }) {
      return changedPaths.includes(PATH);
    }

    // ── Messaging helpers ─────────────────────────────────────────────────────
    async sendMessage({ MSG, USER, ROOM }) {
      try {
        const timestamp = Date.now();
        const payload = { user: USER, message: MSG, time: timestamp };
        await fetch(buildURL(`messages/${ROOM}/${timestamp}_${Math.random().toString(36).slice(2)}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
    }

    async getMessages({ ROOM }) {
      try {
        const res = await fetch(buildURL(`messages/${ROOM}`));
        const data = await res.json();
        if (!data || typeof data !== "object") return "[]";
        const msgs = Object.values(data).sort((a, b) => a.time - b.time);
        return JSON.stringify(msgs);
      } catch (e) {
        return "[]";
      }
    }

    listenToRoom({ ROOM }) {
      startListener(`messages/${ROOM}`);
    }

    whenNewMessage({ ROOM }) {
      const path = `messages/${ROOM}`;
      if (changedPaths.includes(path)) {
        changedPaths = changedPaths.filter(p => p !== path);
        return true;
      }
      return false;
    }

    getTimestamp() {
      return Date.now();
    }
  }

  Scratch.extensions.register(new RovaFirebase());
})();
