(function () {
  // ─── Config ────────────────────────────────────────────────────────────────
  const FIREBASE_URL = "https://rovaapp2026-default-rtdb.firebaseio.com";
  const MAX_MESSAGES = 100; // max messages to keep per room

  // ─── State ─────────────────────────────────────────────────────────────────
  let sockets = {};         // roomId -> WebSocket
  let roomMessages = {};    // roomId -> array of message objects
  let newMessageRooms = []; // rooms that have received new messages since last hat check
  let latestMessage = {};   // roomId -> latest message object

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function getRoomPath(room) {
    return `chat_rooms/${room.replace(/[.#$\[\]\/]/g, '_')}`;
  }

  function connectRoom(room) {
    if (sockets[room] && sockets[room].readyState <= 1) return; // already connected
    const path = getRoomPath(room);
    const wsUrl = FIREBASE_URL.replace('https://', 'wss://') + `/${path}/messages.json?ns=${FIREBASE_URL.split('//')[1].split('.')[0]}`;
    // Use SSE for real-time updates (Firebase doesn't expose raw WebSocket, but uses it internally via SSE)
    startSSE(room, path);
  }

  function startSSE(room, path) {
    if (sockets[room]) {
      try { sockets[room].close(); } catch(e) {}
    }
    const url = `${FIREBASE_URL}/${path}/messages.json?alt=sse&orderBy="time"&limitToLast=50`;
    const es = new EventSource(url);

    es.addEventListener('put', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data.data) return;
        if (!roomMessages[room]) roomMessages[room] = [];

        if (data.path === '/') {
          // Initial load — populate existing messages
          const msgs = data.data;
          if (typeof msgs === 'object') {
            const arr = Object.entries(msgs)
              .map(([k, v]) => ({ id: k, ...v }))
              .sort((a, b) => (a.time || 0) - (b.time || 0));
            roomMessages[room] = arr.slice(-MAX_MESSAGES);
          }
        } else {
          // New message added
          const msgId = data.path.replace('/', '');
          const msg = { id: msgId, ...data.data };
          roomMessages[room].push(msg);
          if (roomMessages[room].length > MAX_MESSAGES) {
            roomMessages[room] = roomMessages[room].slice(-MAX_MESSAGES);
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
        if (roomMessages[room].length > MAX_MESSAGES) {
          roomMessages[room] = roomMessages[room].slice(-MAX_MESSAGES);
        }
      } catch (err) {}
    });

    es.onerror = () => {
      // Reconnect after 3 seconds on error
      setTimeout(() => startSSE(room, path), 3000);
    };

    sockets[room] = es;
  }

  async function postMessage(room, msgObj) {
    const path = getRoomPath(room);
    const url = `${FIREBASE_URL}/${path}/messages.json`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgObj)
      });
    } catch (e) {}
  }

  async function deleteOldMessages(room) {
    // Keep only last MAX_MESSAGES in DB
    const path = getRoomPath(room);
    const url = `${FIREBASE_URL}/${path}/messages.json?orderBy="time"&limitToFirst=1`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data && typeof data === 'object') {
        const oldestKey = Object.keys(data)[0];
        if (oldestKey) {
          await fetch(`${FIREBASE_URL}/${path}/messages/${oldestKey}.json`, { method: 'DELETE' });
        }
      }
    } catch (e) {}
  }

  // ─── Extension ─────────────────────────────────────────────────────────────
  class RovaChat {
    getInfo() {
      return {
        id: 'rovachat',
        name: 'Rova Chat',
        color1: '#c2185b',
        color2: '#880e4f',
        blocks: [
          // ── Connection ────────────────────────────────────────────────────
          {
            opcode: 'joinRoom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'join chat room [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'leaveRoom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'leave chat room [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'isInRoom',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'connected to room [ROOM]?',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          '---',
          // ── Sending ───────────────────────────────────────────────────────
          {
            opcode: 'sendMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send [MSG] as [USER] to room [ROOM]',
            arguments: {
              MSG: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello!' },
              USER: { type: Scratch.ArgumentType.STRING, defaultValue: 'Player1' },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'sendMessageWithIV',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send [MSG] with IV [IV] as [USER] to room [ROOM]',
            arguments: {
              MSG: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
              IV: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
              USER: { type: Scratch.ArgumentType.STRING, defaultValue: 'Player1' },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          '---',
          // ── Receiving — hat blocks ─────────────────────────────────────────
          {
            opcode: 'whenNewMessage',
            blockType: Scratch.BlockType.HAT,
            text: 'when new message in room [ROOM]',
            isEdgeActivated: false,
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          '---',
          // ── Latest message ────────────────────────────────────────────────
          {
            opcode: 'latestMsgText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message text in [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'latestMsgUser',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message user in [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'latestMsgTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message time in [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'latestMsgIV',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message IV in [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'latestMsgEncrypted',
            blockType: Scratch.BlockType.REPORTER,
            text: 'latest message encrypted? in [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          '---',
          // ── All messages ──────────────────────────────────────────────────
          {
            opcode: 'getMessageCount',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message count in room [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageText',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] text in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageUser',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] user in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageTime',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] time in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getMessageIV',
            blockType: Scratch.BlockType.REPORTER,
            text: 'message [INDEX] IV in room [ROOM]',
            arguments: {
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          {
            opcode: 'getAllMessages',
            blockType: Scratch.BlockType.REPORTER,
            text: 'all messages in room [ROOM] as JSON',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
          },
          '---',
          // ── Utilities ─────────────────────────────────────────────────────
          {
            opcode: 'clearLocalMessages',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear local messages in room [ROOM]',
            arguments: {
              ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: 'general' }
            }
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
            arguments: {
              TS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          }
        ]
      };
    }

    // ── Connection ────────────────────────────────────────────────────────────
    joinRoom({ ROOM }) {
      connectRoom(String(ROOM));
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

    // ── Sending ───────────────────────────────────────────────────────────────
    async sendMessage({ MSG, USER, ROOM }) {
      await postMessage(String(ROOM), {
        text: String(MSG),
        user: String(USER),
        time: Date.now(),
        encrypted: false
      });
    }

    async sendMessageWithIV({ MSG, IV, USER, ROOM }) {
      await postMessage(String(ROOM), {
        text: String(MSG),
        iv: String(IV),
        user: String(USER),
        time: Date.now(),
      });
    }

    // ── Hat blocks ────────────────────────────────────────────────────────────
    whenNewMessage({ ROOM }) {
      const room = String(ROOM);
      if (newMessageRooms.includes(room)) {
        newMessageRooms = newMessageRooms.filter(r => r !== room);
        return true;
      }
      return false;
    }

    // ── Latest message ────────────────────────────────────────────────────────
    latestMsgText({ ROOM }) {
      return latestMessage[String(ROOM)]?.text ?? '';
    }

    latestMsgUser({ ROOM }) {
      return latestMessage[String(ROOM)]?.user ?? '';
    }

    latestMsgTime({ ROOM }) {
      return latestMessage[String(ROOM)]?.time ?? '';
    }

    latestMsgIV({ ROOM }) {
      return latestMessage[String(ROOM)]?.iv ?? '';
    }

    latestMsgEncrypted({ ROOM }) {
      return latestMessage[String(ROOM)]?.encrypted ?? false;
    }

    // ── All messages ──────────────────────────────────────────────────────────
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

    // ── Utilities ─────────────────────────────────────────────────────────────
    clearLocalMessages({ ROOM }) {
      roomMessages[String(ROOM)] = [];
    }

    getTimestamp() {
      return Date.now();
    }

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