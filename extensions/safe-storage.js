(function() {
  class SafeStorage {
    getInfo() {
      return {
        id: "safestorage",
        name: "Safe Storage",
        color1: "#4C97FF",
        color2: "#4280D7",
        blocks: [
          {
            opcode: "setItem",
            blockType: Scratch.BlockType.COMMAND,
            text: "set storage key [KEY] to [VALUE]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" },
              VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "value" }
            }
          },
          {
            opcode: "getItem",
            blockType: Scratch.BlockType.REPORTER,
            text: "get storage key [KEY]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
            }
          },
          {
            opcode: "deleteItem",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete storage key [KEY]",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
            }
          },
          {
            opcode: "keyExists",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "storage key [KEY] exists?",
            arguments: {
              KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "key" }
            }
          },
          {
            opcode: "clearAll",
            blockType: Scratch.BlockType.COMMAND,
            text: "clear all storage"
          }
        ]
      };
    }

    // Internal fallback in-memory store for sandboxed environments
    _memStore = {};

    _get(key) {
      try {
        const val = localStorage.getItem("safestorage_" + key);
        return val !== null ? val : (this._memStore[key] ?? "");
      } catch(e) {
        return this._memStore[key] ?? "";
      }
    }

    _set(key, value) {
      try {
        localStorage.setItem("safestorage_" + key, value);
      } catch(e) {}
      this._memStore[key] = value;
    }

    _delete(key) {
      try {
        localStorage.removeItem("safestorage_" + key);
      } catch(e) {}
      delete this._memStore[key];
    }

    _exists(key) {
      try {
        return localStorage.getItem("safestorage_" + key) !== null;
      } catch(e) {
        return key in this._memStore;
      }
    }

    setItem({ KEY, VALUE }) {
      this._set(String(KEY), String(VALUE));
    }

    getItem({ KEY }) {
      return this._get(String(KEY));
    }

    deleteItem({ KEY }) {
      this._delete(String(KEY));
    }

    keyExists({ KEY }) {
      return this._exists(String(KEY));
    }

    clearAll() {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith("safestorage_"))
          .forEach(k => localStorage.removeItem(k));
      } catch(e) {}
      this._memStore = {};
    }
  }

  Scratch.extensions.register(new SafeStorage());
})();