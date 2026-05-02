(function () {
  "use strict";

  class GitHubPagesPush {
    constructor() {
      this._token = "";
      this._owner = "";
      this._repo = "";
      this._lastStatus = "idle";
      this._lastResponse = "";
    }

    getInfo() {
      return {
        id: "githubpagespush",
        name: "GitHub Pages Push",
        color1: "#2da44e",
        color2: "#218a3e",
        blocks: [
          {
            opcode: "setup",
            blockType: Scratch.BlockType.COMMAND,
            text: "set GitHub token [TOKEN] owner [OWNER] repo [REPO]",
            arguments: {
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "your_pat_here" },
              OWNER: { type: Scratch.ArgumentType.STRING, defaultValue: "ayaanramin" },
              REPO:  { type: Scratch.ArgumentType.STRING, defaultValue: "RovaApp" },
            },
          },
          { blockType: Scratch.BlockType.LABEL, text: "Push Files" },
          {
            opcode: "pushText",
            blockType: Scratch.BlockType.COMMAND,
            text: "push text [CONTENT] to file [PATH] with message [MSG]",
            arguments: {
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "<h1>Hello</h1>" },
              PATH:    { type: Scratch.ArgumentType.STRING, defaultValue: "index.html" },
              MSG:     { type: Scratch.ArgumentType.STRING, defaultValue: "Update from Penguinmod" },
            },
          },
          { blockType: Scratch.BlockType.LABEL, text: "Status" },
          {
            opcode: "getStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: "push status",
          },
          {
            opcode: "getResponse",
            blockType: Scratch.BlockType.REPORTER,
            text: "last response",
          },
          {
            opcode: "isPushing",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "is pushing?",
          },
          {
            opcode: "pushSucceeded",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "push succeeded?",
          },
          { blockType: Scratch.BlockType.LABEL, text: "Utilities" },
          {
            opcode: "textToBase64",
            blockType: Scratch.BlockType.REPORTER,
            text: "text to base64 [TEXT]",
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello World" },
            },
          },
          {
            opcode: "stripDataURL",
            blockType: Scratch.BlockType.REPORTER,
            text: "strip data URL prefix [TEXT]",
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: "data:text/html;base64,SGVsbG8=" },
            },
          },
          {
            opcode: "pushFileFromDataURL",
            blockType: Scratch.BlockType.COMMAND,
            text: "push file (from open file block) [DATAURL] to [PATH] with message [MSG]",
            arguments: {
              DATAURL: { type: Scratch.ArgumentType.STRING, defaultValue: "" },
              PATH:    { type: Scratch.ArgumentType.STRING, defaultValue: "index.html" },
              MSG:     { type: Scratch.ArgumentType.STRING, defaultValue: "Update from Penguinmod" },
            },
          },
        ],
      };
    }

    setup({ TOKEN, OWNER, REPO }) {
      this._token = String(TOKEN).trim();
      this._owner = String(OWNER).trim();
      this._repo  = String(REPO).trim();
      this._lastStatus = "ready";
    }

    async pushText({ CONTENT, PATH, MSG }) {
      const base64 = this._toBase64(String(CONTENT));
      await this._pushToGitHub(String(PATH), base64, String(MSG));
    }

    async pushFileFromDataURL({ DATAURL, PATH, MSG }) {
      const raw = String(DATAURL);
      const commaIdx = raw.indexOf(",");
      const base64 = commaIdx !== -1 ? raw.substring(commaIdx + 1) : raw;
      await this._pushToGitHub(String(PATH), base64, String(MSG));
    }

    getStatus() {
      return this._lastStatus;
    }

    getResponse() {
      return this._lastResponse;
    }

    isPushing() {
      return this._lastStatus === "pushing";
    }

    pushSucceeded() {
      return this._lastStatus === "success";
    }

    textToBase64({ TEXT }) {
      return this._toBase64(String(TEXT));
    }

    stripDataURL({ TEXT }) {
      const str = String(TEXT);
      const idx = str.indexOf(",");
      return idx !== -1 ? str.substring(idx + 1) : str;
    }

    // ---- Internal helpers ----

    _toBase64(str) {
      try {
        return btoa(unescape(encodeURIComponent(str)));
      } catch (e) {
        return btoa(str);
      }
    }

    _headers() {
      return {
        Authorization: "token " + this._token,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      };
    }

    async _pushToGitHub(path, base64Content, message) {
      if (!this._token || !this._owner || !this._repo) {
        this._lastStatus = "error: not set up";
        return;
      }

      this._lastStatus = "pushing";
      const url = `https://api.github.com/repos/${this._owner}/${this._repo}/contents/${path}`;

      try {
        // Step 1: GET current file SHA (if it exists)
        let sha = null;
        const getResp = await fetch(url, { headers: this._headers() });
        if (getResp.ok) {
          const data = await getResp.json();
          sha = data.sha || null;
        }
        // 404 = file doesn't exist yet, that's fine

        // Step 2: PUT the file
        const body = { message, content: base64Content };
        if (sha) body.sha = sha;

        const putResp = await fetch(url, {
          method: "PUT",
          headers: this._headers(),
          body: JSON.stringify(body),
        });

        const putData = await putResp.json();
        this._lastResponse = JSON.stringify(putData);

        if (putResp.ok) {
          this._lastStatus = "success";
        } else {
          this._lastStatus = "error: " + (putData.message || putResp.status);
        }
      } catch (e) {
        this._lastStatus = "error: " + e.message;
        this._lastResponse = e.message;
      }
    }
  }

  Scratch.extensions.register(new GitHubPagesPush());
})();