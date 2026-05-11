// Rova Presence Extension
// Real-time online/offline detection using Firebase SDK onDisconnect

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova Presence requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  const FIREBASE_URL = "https://rovaapp2026-default-rtdb.firebaseio.com";
  const FIREBASE_APP_NAME = "rovaapp2026";

  // ── State ────────────────────────────────────────────────────────────────────
  let db            = null;   // Firebase database instance
  let myUsername    = "";
  let presenceRef   = null;
  let watchedUsers  = {};     // username -> { online, lastSeen, listener }
  let statusChanged = [];     // usernames whose status just changed
  let sdkReady      = false;

  // ── Load Firebase SDK dynamically ────────────────────────────────────────────
  function loadFirebaseSDK() {
    return new Promise((resolve) => {
      if (window.firebase && window.firebase.database) {
        resolve();
        return;
      }

      // Load Firebase app + database SDK
      const appScript = document.createElement("script");
      appScript.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
      appScript.onload = () => {
        const dbScript = document.createElement("script");
        dbScript.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
        dbScript.onload = () => resolve();
        document.head.appendChild(dbScript);
      };
      document.head.appendChild(appScript);
    });
  }

  async function ensureSDK() {
    if (sdkReady) return;
    await loadFirebaseSDK();
    if (!window.firebase.apps.find(a => a.name === FIREBASE_APP_NAME) &&
        !window.firebase.apps.length) {
      window.firebase.initializeApp({
        databaseURL: FIREBASE_URL
      });
    }
    db = window.firebase.database();
    sdkReady = true;
  }

  // ── Extension ─────────────────────────────────────────────────────────────────
  class RovaPresence {
    getInfo() {
      return {
        id: "rovapresence",
        name: "Rova Presence",
        color1: "#2e7d32",
        color2: "#1b5e20",
        blocks: [

          // ── Setup ────────────────────────────────────────────────────────────
          {
            opcode: "goOnline",
            blockType: BlockType.COMMAND,
            text: "go online as [USER]",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player1" }
            }
          },
          {
            opcode: "goOffline",
            blockType: BlockType.COMMAND,
            text: "go offline"
          },
          "---",

          // ── Watch others ─────────────────────────────────────────────────────
          {
            opcode: "watchUser",
            blockType: BlockType.COMMAND,
            text: "watch presence of [USER]",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "unwatchUser",
            blockType: BlockType.COMMAND,
            text: "stop watching presence of [USER]",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "unwatchAll",
            blockType: BlockType.COMMAND,
            text: "stop watching all presence"
          },
          "---",

          // ── Reporters ────────────────────────────────────────────────────────
          {
            opcode: "isOnline",
            blockType: BlockType.BOOLEAN,
            text: "[USER] is online?",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "lastSeen",
            blockType: BlockType.REPORTER,
            text: "[USER] last seen timestamp",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "lastSeenFormatted",
            blockType: BlockType.REPORTER,
            text: "[USER] last seen",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "secondsSinceOnline",
            blockType: BlockType.REPORTER,
            text: "seconds since [USER] was online",
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "presenceSDKReady",
            blockType: BlockType.BOOLEAN,
            text: "presence SDK ready?"
          },
          "---",

          // ── Hat blocks ───────────────────────────────────────────────────────
          {
            opcode: "whenUserComesOnline",
            blockType: BlockType.HAT,
            text: "when [USER] comes online",
            isEdgeActivated: false,
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "whenUserGoesOffline",
            blockType: BlockType.HAT,
            text: "when [USER] goes offline",
            isEdgeActivated: false,
            arguments: {
              USER: { type: ArgumentType.STRING, defaultValue: "Player2" }
            }
          },
          {
            opcode: "whenAnyStatusChanges",
            blockType: BlockType.HAT,
            text: "when any watched user's status changes",
            isEdgeActivated: false
          }
        ]
      };
    }

    // ── Setup ──────────────────────────────────────────────────────────────────
    async goOnline({ USER }) {
      await ensureSDK();
      myUsername = Cast.toString(USER);
      const safe = myUsername.replace(/[.#$[\]/]/g, "_");
      presenceRef = db.ref(`rova_presence/${safe}`);

      // When connection drops for ANY reason, Firebase server sets us offline
      await presenceRef.onDisconnect().set({
        online:   false,
        lastSeen: window.firebase.database.ServerValue.TIMESTAMP
      });

      // Mark as online now
      await presenceRef.set({
        online:   true,
        lastSeen: window.firebase.database.ServerValue.TIMESTAMP
      });
    }

    async goOffline() {
      if (!presenceRef) return;
      try {
        await presenceRef.onDisconnect().cancel();
        await presenceRef.set({
          online:   false,
          lastSeen: window.firebase.database.ServerValue.TIMESTAMP
        });
      } catch(e) {}
      presenceRef = null;
    }

    // ── Watch others ───────────────────────────────────────────────────────────
    async watchUser({ USER }) {
      await ensureSDK();
      const user = Cast.toString(USER);
      if (watchedUsers[user]) return; // already watching

      const safe = user.replace(/[.#$[\]/]/g, "_");
      const ref   = db.ref(`rova_presence/${safe}`);

      // Track previous state to detect transitions
      let prevOnline = null;

      const listener = ref.on("value", (snap) => {
        const data = snap.val();
        const nowOnline = data ? !!data.online : false;
        const lastSeen  = data ? (data.lastSeen || 0) : 0;

        const changed = prevOnline !== null && prevOnline !== nowOnline;

        watchedUsers[user] = {
          ...watchedUsers[user],
          online:      nowOnline,
          lastSeen,
          prevOnline,
          justChanged: changed,
          justCameOn:  changed && nowOnline,
          justWentOff: changed && !nowOnline,
        };

        if (changed && !statusChanged.includes(user)) {
          statusChanged.push(user);
        }

        prevOnline = nowOnline;
      });

      watchedUsers[user] = { online: false, lastSeen: 0, ref, listener,
                             prevOnline: null, justChanged: false,
                             justCameOn: false, justWentOff: false };
    }

    unwatchUser({ USER }) {
      const user = Cast.toString(USER);
      if (!watchedUsers[user]) return;
      watchedUsers[user].ref.off("value", watchedUsers[user].listener);
      delete watchedUsers[user];
    }

    unwatchAll() {
      Object.keys(watchedUsers).forEach(user => {
        watchedUsers[user].ref.off("value", watchedUsers[user].listener);
      });
      watchedUsers = {};
    }

    // ── Reporters ──────────────────────────────────────────────────────────────
    isOnline({ USER }) {
      const u = watchedUsers[Cast.toString(USER)];
      return u ? !!u.online : false;
    }

    lastSeen({ USER }) {
      const u = watchedUsers[Cast.toString(USER)];
      return u ? (u.lastSeen || 0) : 0;
    }

    lastSeenFormatted({ USER }) {
      const u = watchedUsers[Cast.toString(USER)];
      if (!u || !u.lastSeen) return "never";
      if (u.online) return "now";

      const secs = Math.floor((Date.now() - u.lastSeen) / 1000);
      if (secs < 60)   return "just now";
      if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
      if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
      return `${Math.floor(secs / 86400)}d ago`;
    }

    secondsSinceOnline({ USER }) {
      const u = watchedUsers[Cast.toString(USER)];
      if (!u || !u.lastSeen) return 0;
      return Math.floor((Date.now() - u.lastSeen) / 1000);
    }

    presenceSDKReady() { return sdkReady; }

    // ── Hat blocks ─────────────────────────────────────────────────────────────
    whenUserComesOnline({ USER }) {
      const user = Cast.toString(USER);
      const u = watchedUsers[user];
      if (!u) return false;
      if (u.justCameOn) {
        watchedUsers[user].justCameOn = false;
        return true;
      }
      return false;
    }

    whenUserGoesOffline({ USER }) {
      const user = Cast.toString(USER);
      const u = watchedUsers[user];
      if (!u) return false;
      if (u.justWentOff) {
        watchedUsers[user].justWentOff = false;
        return true;
      }
      return false;
    }

    whenAnyStatusChanges() {
      if (statusChanged.length > 0) {
        statusChanged = [];
        return true;
      }
      return false;
    }
  }

  Scratch.extensions.register(new RovaPresence());
})(Scratch);
