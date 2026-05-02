(function (Scratch) {
  "use strict";

  // --- SHA-256 implementation (no external dependencies) ---
  function sha256(message) {
    const K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,
      0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,
      0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,
      0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,
      0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,
      0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,
      0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,
      0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,
      0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];

    function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
    function Ch(x, y, z)  { return (x & y) ^ (~x & z); }
    function Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
    function S0(x) { return rotr(2,x) ^ rotr(13,x) ^ rotr(22,x); }
    function S1(x) { return rotr(6,x) ^ rotr(11,x) ^ rotr(25,x); }
    function s0(x) { return rotr(7,x) ^ rotr(18,x) ^ (x >>> 3); }
    function s1(x) { return rotr(17,x) ^ rotr(19,x) ^ (x >>> 10); }

    function add32(...args) {
      return args.reduce((a, b) => (a + b) >>> 0);
    }

    // UTF-8 encode
    const bytes = [];
    for (let i = 0; i < message.length; i++) {
      const code = message.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else {
        bytes.push(
          0xe0 | (code >> 12),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        );
      }
    }

    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);

    let h0=0x6a09e667, h1=0xbb67ae85, h2=0x3c6ef372, h3=0xa54ff53a;
    let h4=0x510e527f, h5=0x9b05688c, h6=0x1f83d9ab, h7=0x5be0cd19;

    for (let i = 0; i < bytes.length; i += 64) {
      const w = [];
      for (let j = 0; j < 16; j++) {
        w[j] = (bytes[i+j*4]<<24)|(bytes[i+j*4+1]<<16)|(bytes[i+j*4+2]<<8)|bytes[i+j*4+3];
      }
      for (let j = 16; j < 64; j++) {
        w[j] = add32(s1(w[j-2]), w[j-7], s0(w[j-15]), w[j-16]);
      }

      let [a,b,c,d,e,f,g,h] = [h0,h1,h2,h3,h4,h5,h6,h7];

      for (let j = 0; j < 64; j++) {
        const T1 = add32(h, S1(e), Ch(e,f,g), K[j], w[j]);
        const T2 = add32(S0(a), Maj(a,b,c));
        h=g; g=f; f=e; e=add32(d,T1);
        d=c; c=b; b=a; a=add32(T1,T2);
      }

      h0=add32(h0,a); h1=add32(h1,b); h2=add32(h2,c); h3=add32(h3,d);
      h4=add32(h4,e); h5=add32(h5,f); h6=add32(h6,g); h7=add32(h7,h);
    }

    return [h0,h1,h2,h3,h4,h5,h6,h7]
      .map(v => v.toString(16).padStart(8,"0"))
      .join("");
  }

  // --- Extension Class ---
  class HashExtension {
    getInfo() {
      return {
        id: "hashExtension",
        name: "Password Hasher",
        color1: "#4a4a8f",
        color2: "#33336b",
        blocks: [
          {
            opcode: "hashWithSalt",
            blockType: Scratch.BlockType.REPORTER,
            text: "SHA-256 hash of [PASSWORD] with salt [SALT]",
            arguments: {
              PASSWORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "mypassword",
              },
              SALT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "mysalt",
              },
            },
          },
          {
            opcode: "hashWithSaltAndPepper",
            blockType: Scratch.BlockType.REPORTER,
            text: "hash [PASSWORD] salt [SALT] pepper [PEPPER]",
            arguments: {
              PASSWORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "mypassword",
              },
              SALT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "mysalt",
              },
              PEPPER: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "pepper",
              },
            },
          },
          {
            opcode: "verifyHash",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "[PASSWORD] with salt [SALT] matches hash [HASH]",
            arguments: {
              PASSWORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "mypassword",
              },
              SALT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "mysalt",
              },
              HASH: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
          },
          {
            opcode: "rawHash",
            blockType: Scratch.BlockType.REPORTER,
            text: "SHA-256 of [TEXT]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "hello",
              },
            },
          },
        ],
      };
    }

    // salt + password (prepend salt)
    hashWithSalt({ PASSWORD, SALT }) {
      return sha256(String(SALT) + String(PASSWORD));
    }

    // salt + password + pepper
    hashWithSaltAndPepper({ PASSWORD, SALT, PEPPER }) {
      return sha256(String(SALT) + String(PASSWORD) + String(PEPPER));
    }

    // verify: hash(salt+password) === given hash
    verifyHash({ PASSWORD, SALT, HASH }) {
      return sha256(String(SALT) + String(PASSWORD)) === String(HASH).toLowerCase();
    }

    // plain SHA-256 with no salt
    rawHash({ TEXT }) {
      return sha256(String(TEXT));
    }
  }

  Scratch.extensions.register(new HashExtension());
})(Scratch);