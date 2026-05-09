(function () {
  // ─── Config ───────────────────────────────────────────────────────────────────
  const FIREBASE_URL = "https://rovaapp2026-default-rtdb.firebaseio.com";
  let initialLoadSize = 50;

  // ─── State ────────────────────────────────────────────────────────────────────
  let sockets         = {};
  let initialLoaded   = {};
  let roomMessages    = {};
  let newMessageRooms = [];
  let latestMessage   = {};
  let oldestKey       = {};  // Firebase push key of oldest loaded message
  let hasMore         = {};
  let olderLoaded     = [];

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function getRoomPath(room) {
    return `chat_rooms/${room.replace(/[.#$\[\]\/]/g, '_')}`;
  }

  // ── SSE — uses $key ordering (no index needed) ────────────────────────────────
  function startSSE(room, path) {
    initialLoaded[room] = false;
    if (sockets[room]) {
      try { sockets[room].close(); } catch(e) {}
    }
    const url = `${FIREBASE_URL}/${path}/messages.json?alt=sse&orderBy="$key"&limitToLast=${initialLoadSize}`;
    const es = new EventSource(url);

    es.addEventListener('put', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.data) { initialLoaded[room] = true; return; }
        if (!roomMessages[room]) roomMessages[room] = [];

        if (data.path === '/') {
          const msgs = data.data;
          if (typeof msgs === 'object') {
            const arr = Object.entries(msgs)
              .map(([k, v]) => ({ id: k, ...v }))
              .sort((a, b) => (a.time || 0) - (b.time || 0));
            roomMessages[room] = arr;
            if (arr.length > 0) {
              oldestKey[room] = arr[0].id;
              hasMore[room] = arr.length >= initialLoadSize;
            } else {
              hasMore[room] = false;
            }
          }
          initialLoaded[room] = true;
        } else {
          const msgId = data.path.replace('/', '');
          const msg = { id: msgId, ...data.data };
          if (!roomMessages[room].find(m => m.id === msgId)) {
            roomMessages[room].push(msg);
          }
          latestMessage[room] = msg;
          if (!newMessageRooms.includes(room)) newMessageRooms.push(room);
        }
      } catch (err) {}
    });

    es.addEventListener('patch', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.data) return;
        if (!roomMessages[room]) roomMessages[room] = [];
        Object.entries(data.data).forEach(([k, v]) => {
          const msg = { id: k, ...v };
          const existing = roomMessages[room].findIndex(m => m.id === k);
          if (existing >= 0) {
            roomMessages[room][existing] = msg;
          } else {
            roomMessages[room].push(msg);
            latestMessage[room] = msg;
            if (!newMessageRooms.includes(room)) newMessageRooms.push(room);
          }
        });
        roomMessages[room].sort((a, b) => (a.time || 0) - (b.time || 0));
      } catch (err) {}
    });

    es.onerror = () => setTimeout(() => startSSE(room, path), 3000);
    sockets[room] = es;
  }

  // ── Pagination — also uses $key ordering ──────────────────────────────────────
  async function fetchOlderMessages(room, count) {
    const path = getRoomPath(room);
    const oldest = oldestKey[room];

    // If no oldest key (fresh or after clear), fetch most recent N messages
    const url = oldest
      ? `${FIREBASE_URL}/${path}/messages.json?orderBy="$key"&endBefore="${oldest}"&limitToLast=${count}`
      : `${FIREBASE_URL}/${path}/messages.json?orderBy="$key"&limitToLast=${count}`;
    try {
      const res  = await fetch(url);
      const data = await res.json();

      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        hasMore[room] = false;
        return;
      }

      const arr = Object.entries(data)
        .map(([k, v]) => ({ id: k, ...v }))
        .sort((a, b) => (a.time || 0) - (b.time || 0));

      roomMessages[room] = [...arr, ...(roomMessages[room] || [])];
      if (arr.length > 0) oldestKey[room] = arr[0].id;
      hasMore[room] = arr.length >= count;
    } catch(e) {
      hasMore[room] = false;
    }
  }

  async function postMessage(room, msgObj) {
    const path = getRoomPath(room);
    try {
      await fetch(`${FIREBASE_URL}/${path}/messages.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgObj)
      });
    } catch (e) {}
  }

  // ─── Extension ────────────────────────────────────────────────────────────────
  class RovaChat {
    getInfo() {
      return {
        id: 'rovachat',
        name: 'Rova Chat',
        color1: '#c2185b',
        color2: '#880e4f',
        blocks: [
          // ── Connection ────────────────────────────────────────────────────────
          {
            opcode: 'joinRoom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'join chat room [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'leaveRoom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'leave chat room [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'isInRoom',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'connected to room [ROOM]?',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'roomLoaded',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'room [ROOM] messages loaded?',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          '---',
          // ── Sending ───────────────────────────────────────────────────────────
          {
            opcode: 'sendMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send [MSG] as [USER] to room [ROOM]',
            arguments: {
              MSG:  { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello!' },
              USER: { type: Scratch.ArgumentType.STRING, defaultValue: 'Player1' },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'sendMessageWithIV',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send [MSG] with IV [IV] as [USER] to room [ROOM]',
            arguments: {
              MSG:  { type: Scratch.ArgumentType.STRING, defaultValue: '' },
              IV:   { type: Scratch.ArgumentType.STRING, defaultValue: '' },
              USER: { type: Scratch.ArgumentType.STRING, defaultValue: 'Player1' },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          '---',
          // ── Real-time hat ─────────────────────────────────────────────────────
          {
            opcode: 'whenNewMessage',
            blockType: Scratch.BlockType.HAT,
            text: 'when new message in room [ROOM]',
            isEdgeActivated: false,
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          '---',
          // ── Latest message ────────────────────────────────────────────────────
          {
            opcode: 'latestMsgText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message text in [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'latestMsgUser',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message user in [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'latestMsgTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message time in [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'latestMsgIV',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message IV in [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'latestMsgEncrypted',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message encrypted? in [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          '---',
          // ── All messages ──────────────────────────────────────────────────────
          {
            opcode: 'getMessageCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message count in room [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'getMessageText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] text in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM:  { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageUser',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] user in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM:  { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] time in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM:  { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageIV',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] IV in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM:  { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getAllMessages',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all messages in room [ROOM] as JSON',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          '---',
          // ── Pagination ────────────────────────────────────────────────────────
          {
            opcode: 'setInitialLoad',
            blockType: Scratch.BlockType.COMMAND,
            text: 'load last [COUNT] messages when joining a room',
            arguments: { COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 } }
          },
          {
            opcode: 'loadOlderMessages',
            blockType: Scratch.BlockType.COMMAND,
            text: 'load [COUNT] older messages in room [ROOM]',
            arguments: {
              COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 30 },
              ROOM:  { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'whenOlderLoaded',
            blockType: Scratch.BlockType.HAT,
            text: 'when older messages loaded in room [ROOM]',
            isEdgeActivated: false,
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'hasMoreMessages',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'more old messages available in room [ROOM]?',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          '---',
          // ── Utilities ─────────────────────────────────────────────────────────
          {
            opcode: 'clearLocalMessages',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear local messages in room [ROOM]',
            arguments: { ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' } }
          },
          {
            opcode: 'getTimestamp',
            blockType: Scratch.BlockType.REPORTER,
            text: 'current timestamp'
          },
          {
            opcode: 'formatTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'format timestamp [TS]',
            arguments: { TS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 } }
          }
        ]
      };
    }

    // ── Connection ──────────────────────────────────────────────────────────────
    joinRoom({ ROOM }) {
      const room = String(ROOM);
      startSSE(room, getRoomPath(room));
    }

    leaveRoom({ ROOM }) {
      const room = String(ROOM);
      if (sockets[room]) {
        try { sockets[room].close(); } catch(e) {}
        delete sockets[room];
      }
    }

    isInRoom({ ROOM }) {
      const room = String(ROOM);
      return !!sockets[room] && sockets[room].readyState !== 2;
    }

    roomLoaded({ ROOM }) {
      return !!initialLoaded[String(ROOM)];
    }

    // ── Sending ─────────────────────────────────────────────────────────────────
    async sendMessage({ MSG, USER, ROOM }) {
      await postMessage(String(ROOM), {
        text: String(MSG), user: String(USER), time: Date.now(), encrypted: false
      });
    }

    async sendMessageWithIV({ MSG, IV, USER, ROOM }) {
      await postMessage(String(ROOM), {
        text: String(MSG), iv: String(IV), user: String(USER), time: Date.now()
      });
    }

    // ── Hat blocks ──────────────────────────────────────────────────────────────
    whenNewMessage({ ROOM }) {
      const room = String(ROOM);
      if (newMessageRooms.includes(room)) {
        newMessageRooms = newMessageRooms.filter(r => r !== room);
        return true;
      }
      return false;
    }

    whenOlderLoaded({ ROOM }) {
      const room = String(ROOM);
      if (olderLoaded.includes(room)) {
        olderLoaded = olderLoaded.filter(r => r !== room);
        return true;
      }
      return false;
    }

    // ── Latest message ──────────────────────────────────────────────────────────
    latestMsgText({ ROOM })      { return latestMessage[String(ROOM)]?.text      ?? ''; }
    latestMsgUser({ ROOM })      { return latestMessage[String(ROOM)]?.user      ?? ''; }
    latestMsgTime({ ROOM })      { return latestMessage[String(ROOM)]?.time      ?? ''; }
    latestMsgIV({ ROOM })        { return latestMessage[String(ROOM)]?.iv        ?? ''; }
    latestMsgEncrypted({ ROOM }) { return latestMessage[String(ROOM)]?.encrypted ?? false; }

    // ── All messages ────────────────────────────────────────────────────────────
    getMessageCount({ ROOM }) {
      return (roomMessages[String(ROOM)] ?? []).length;
    }

    getMessageText({ INDEX, ROOM }) {
      const msgs = roomMessages[String(ROOM)] ?? [];
      const idx = Math.max(1, Math.min(Number(INDEX), msgs.length));
      return msgs[idx - 1]?.text ?? '';
    }

    getMessageUser({ INDEX, ROOM }) {
      const msgs = roomMessages[String(ROOM)] ?? [];
      const idx = Math.max(1, Math.min(Number(INDEX), msgs.length));
      return msgs[idx - 1]?.user ?? '';
    }

    getMessageTime({ INDEX, ROOM }) {
      const msgs = roomMessages[String(ROOM)] ?? [];
      const idx = Math.max(1, Math.min(Number(INDEX), msgs.length));
      return msgs[idx - 1]?.time ?? '';
    }

    getMessageIV({ INDEX, ROOM }) {
      const msgs = roomMessages[String(ROOM)] ?? [];
      const idx = Math.max(1, Math.min(Number(INDEX), msgs.length));
      return msgs[idx - 1]?.iv ?? '';
    }

    getAllMessages({ ROOM }) {
      return JSON.stringify(roomMessages[String(ROOM)] ?? []);
    }

    // ── Pagination ──────────────────────────────────────────────────────────────
    setInitialLoad({ COUNT }) {
      initialLoadSize = Math.max(1, Math.round(Number(COUNT)));
    }

    async loadOlderMessages({ COUNT, ROOM }) {
      const room = String(ROOM);
      const count = Math.max(1, Math.round(Number(COUNT)));
      if (hasMore[room] === false) return;
      await fetchOlderMessages(room, count);
      if (!olderLoaded.includes(room)) olderLoaded.push(room);
    }

    hasMoreMessages({ ROOM }) {
      return hasMore[String(ROOM)] !== false;
    }

    // ── Utilities ───────────────────────────────────────────────────────────────
    clearLocalMessages({ ROOM }) {
      const room = String(ROOM);
      roomMessages[room]  = [];
      delete oldestKey[room];
      delete hasMore[room];
      initialLoaded[room] = false;
    }

    getTimestamp() { return Date.now(); }

    formatTime({ TS }) {
      const d = new Date(Number(TS));
      const h = d.getHours() % 12 || 12;
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
      return `${h}:${m} ${ampm}`;
    }
  }

  Scratch.extensions.register(new RovaChat());
})();
