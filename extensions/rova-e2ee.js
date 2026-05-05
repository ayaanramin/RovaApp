// Rova E2EE Extension
// Persistent E2EE using ECDH-P256 + AES-GCM
// Keys are automatically saved to localStorage and restored on every session

(() => {
  (function (Scratch) {
    if (!Scratch.extensions.unsandboxed) {
      throw new Error("Rova E2EE requires unsandboxed mode.");
    }

    const STORAGE_PUB  = 'rova_e2ee_publicKey';
    const STORAGE_PRIV = 'rova_e2ee_privateKey';

    function toBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }

    function fromBase64(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    }

    async function generateKeyPair() {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']
      );
      const pub  = toBase64(await crypto.subtle.exportKey('spki',  keyPair.publicKey));
      const priv = toBase64(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey));
      return { pub, priv };
    }

    async function importPublicKey(b64) {
      return crypto.subtle.importKey(
        'spki', fromBase64(b64),
        { name: 'ECDH', namedCurve: 'P-256' }, true, []
      );
    }

    async function importPrivateKey(b64) {
      return crypto.subtle.importKey(
        'pkcs8', fromBase64(b64),
        { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']
      );
    }

    async function deriveSecret(theirPubB64, myPrivB64) {
      const pubKey  = await importPublicKey(theirPubB64);
      const privKey = await importPrivateKey(myPrivB64);
      const shared  = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: pubKey }, privKey,
        { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
      );
      return toBase64(await crypto.subtle.exportKey('raw', shared));
    }

    // ── Shared key cache: secret b64 → CryptoKey ──────────────────────────
    // Importing the same key over and over is expensive. Cache it.
    const keyCache = new Map();
    async function importSharedKey(b64) {
      if (keyCache.has(b64)) return keyCache.get(b64);
      const key = await crypto.subtle.importKey(
        'raw', fromBase64(b64),
        { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
      );
      keyCache.set(b64, key);
      return key;
    }

    async function encryptMsg(message, sharedKeyB64) {
      const key = await importSharedKey(sharedKeyB64);
      const iv  = crypto.getRandomValues(new Uint8Array(12));
      const enc = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key,
        new TextEncoder().encode(message)
      );
      return { encrypted: toBase64(new Uint8Array(enc)), iv: toBase64(iv) };
    }

    async function decryptMsg(encryptedB64, ivB64, sharedKeyB64) {
      const key = await importSharedKey(sharedKeyB64);
      const dec = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: fromBase64(ivB64) },
        key, fromBase64(encryptedB64)
      );
      return new TextDecoder().decode(dec);
    }

    function lsGet(key) {
      try { return localStorage.getItem(key) || ''; } catch(e) { return ''; }
    }
    function lsSet(key, value) {
      try { localStorage.setItem(key, value); } catch(e) {}
    }

    class RovaE2EE {
      constructor() {
        this._pub       = '';
        this._priv      = '';
        this._secret    = '';
        this._encrypted = '';
        this._iv        = '';
        this._decrypted = '';
        this._ready     = false;
        // Decrypted message cache: msgId → decrypted text
        this._cache     = {};
        this._batchResult = '[]';
        this._autoLoad();
      }

      async _autoLoad() {
        const savedPub  = lsGet(STORAGE_PUB);
        const savedPriv = lsGet(STORAGE_PRIV);
        if (savedPub && savedPriv) {
          try {
            await importPublicKey(savedPub);
            await importPrivateKey(savedPriv);
            this._pub   = savedPub;
            this._priv  = savedPriv;
            this._ready = true;
          } catch(e) {
            await this._generate();
          }
        } else {
          await this._generate();
        }
      }

      async _generate() {
        const { pub, priv } = await generateKeyPair();
        this._pub   = pub;
        this._priv  = priv;
        lsSet(STORAGE_PUB,  pub);
        lsSet(STORAGE_PRIV, priv);
        this._ready = true;
      }

      getInfo() {
        return {
          id: 'rovae2ee',
          name: 'Rova E2EE',
          color1: '#2d6a4f',
          color2: '#1b4332',
          blocks: [
            // ── Keys ────────────────────────────────────────────────────────
            {
              opcode: 'isReady',
              blockType: Scratch.BlockType.BOOLEAN,
              text: 'E2EE ready?'
            },
            {
              opcode: 'getPublicKey',
              blockType: Scratch.BlockType.REPORTER,
              text: 'my public key'
            },
            {
              opcode: 'getPrivateKey',
              blockType: Scratch.BlockType.REPORTER,
              text: 'my private key'
            },
            {
              opcode: 'regenerateKeys',
              blockType: Scratch.BlockType.COMMAND,
              text: 'regenerate my keys'
            },
            '---',
            // ── Secret ──────────────────────────────────────────────────────
            {
              opcode: 'createSecret',
              blockType: Scratch.BlockType.REPORTER,
              text: 'create secret from their public key [PUBKEY]',
              arguments: {
                PUBKEY: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
              }
            },
            '---',
            // ── Encrypt ─────────────────────────────────────────────────────
            {
              opcode: 'encrypt',
              blockType: Scratch.BlockType.COMMAND,
              text: 'encrypt [MSG] with secret [SECRET]',
              arguments: {
                MSG:    { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello!' },
                SECRET: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
              }
            },
            {
              opcode: 'getEncrypted',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Encrypted'
            },
            {
              opcode: 'getIV',
              blockType: Scratch.BlockType.REPORTER,
              text: 'IV'
            },
            '---',
            // ── Decrypt (single) ────────────────────────────────────────────
            {
              opcode: 'decrypt',
              blockType: Scratch.BlockType.COMMAND,
              text: 'decrypt [ENC] IV [IV] with secret [SECRET]',
              arguments: {
                ENC:    { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                IV:     { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                SECRET: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
              }
            },
            {
              opcode: 'getDecrypted',
              blockType: Scratch.BlockType.REPORTER,
              text: 'Decrypted'
            },
            '---',
            // ── Batch decrypt ────────────────────────────────────────────────
            {
              opcode: 'batchDecrypt',
              blockType: Scratch.BlockType.COMMAND,
              text: 'batch decrypt messages JSON [JSON] with secret [SECRET]',
              arguments: {
                JSON:   { type: Scratch.ArgumentType.STRING, defaultValue: '[]' },
                SECRET: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
              }
            },
            {
              opcode: 'getBatchResult',
              blockType: Scratch.BlockType.REPORTER,
              text: 'batch decrypted messages'
            },
            '---',
            // ── Cache ────────────────────────────────────────────────────────
            {
              opcode: 'decryptCached',
              blockType: Scratch.BlockType.COMMAND,
              text: 'decrypt [ENC] IV [IV] with secret [SECRET] cache as [ID]',
              arguments: {
                ENC:    { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                IV:     { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                SECRET: { type: Scratch.ArgumentType.STRING, defaultValue: '' },
                ID:     { type: Scratch.ArgumentType.STRING, defaultValue: 'msg-id' }
              }
            },
            {
              opcode: 'getCached',
              blockType: Scratch.BlockType.REPORTER,
              text: 'cached decrypted message [ID]',
              arguments: {
                ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'msg-id' }
              }
            },
            {
              opcode: 'isCached',
              blockType: Scratch.BlockType.BOOLEAN,
              text: 'message [ID] already decrypted?',
              arguments: {
                ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'msg-id' }
              }
            },
            {
              opcode: 'clearCache',
              blockType: Scratch.BlockType.COMMAND,
              text: 'clear decryption cache'
            }
          ]
        };
      }

      // ── Block implementations ────────────────────────────────────────────
      isReady()       { return this._ready; }
      getPublicKey()  { return this._pub; }
      getPrivateKey() { return this._priv; }

      async regenerateKeys() { await this._generate(); }

      async createSecret({ PUBKEY }) {
        try { return await deriveSecret(String(PUBKEY), this._priv); }
        catch(e) { return ''; }
      }

      async encrypt({ MSG, SECRET }) {
        try {
          const { encrypted, iv } = await encryptMsg(String(MSG), String(SECRET));
          this._encrypted = encrypted;
          this._iv = iv;
        } catch(e) {
          this._encrypted = '';
          this._iv = '';
        }
      }

      getEncrypted() { return this._encrypted; }
      getIV()        { return this._iv; }

      async decrypt({ ENC, IV, SECRET }) {
        try {
          this._decrypted = await decryptMsg(String(ENC), String(IV), String(SECRET));
        } catch(e) {
          this._decrypted = '';
        }
      }

      getDecrypted() { return this._decrypted; }

      // ── Batch decrypt: all messages in parallel ───────────────────────────
      // Handles two formats:
      // Format A: { text: '{IV:...,Encrypted:...}', ... }  (your current format)
      // Format B: { text: '...', iv: '...', ... }                  (flat format)
      async batchDecrypt({ JSON: jsonStr, SECRET }) {
        try {
          const msgs   = JSON.parse(String(jsonStr));
          const secret = String(SECRET);
          if (!Array.isArray(msgs)) { this._batchResult = '[]'; return; }

          const results = await Promise.all(
            msgs.map(async (msg) => {
              const id = msg.id || msg.msg_id || '';

              // Return from cache immediately if already decrypted
              if (id && this._cache[id] !== undefined) {
                return { ...msg, decrypted: this._cache[id] };
              }

              try {
                let enc, iv;

                // Format A: text field is a JSON string with IV and Encrypted keys
                if (typeof msg.text === 'string') {
                  try {
                    const parsed = JSON.parse(msg.text);
                    if (parsed && parsed.IV && parsed.Encrypted) {
                      iv  = parsed.IV;
                      enc = parsed.Encrypted;
                    }
                  } catch(e) {
                    // text is not JSON — treat as flat format below
                  }
                }

                // Format B: flat fields
                if (!enc || !iv) {
                  enc = msg.encrypted || msg.text || '';
                  iv  = msg.iv || '';
                }

                if (!enc || !iv) {
                  return { ...msg, decrypted: msg.text || '' };
                }

                const decrypted = await decryptMsg(enc, iv, secret);
                if (id) this._cache[id] = decrypted;
                return { ...msg, decrypted };
              } catch(e) {
                // Decryption failed — return raw text as fallback
                return { ...msg, decrypted: msg.text || '' };
              }
            })
          );

          this._batchResult = JSON.stringify(results);
        } catch(e) {
          this._batchResult = '[]';
        }
      }

      getBatchResult() { return this._batchResult; }

      // ── Cache helpers ────────────────────────────────────────────────────
      async decryptCached({ ENC, IV, SECRET, ID }) {
        const id = String(ID);
        if (this._cache[id] !== undefined) {
          this._decrypted = this._cache[id];
          return;
        }
        try {
          const result = await decryptMsg(String(ENC), String(IV), String(SECRET));
          this._cache[id] = result;
          this._decrypted = result;
        } catch(e) {
          this._decrypted = '';
        }
      }

      getCached({ ID }) {
        return this._cache[String(ID)] ?? '';
      }

      isCached({ ID }) {
        return String(ID) in this._cache;
      }

      clearCache() {
        this._cache = {};
      }
    }

    Scratch.extensions.register(new RovaE2EE());
  })(Scratch);
})();
