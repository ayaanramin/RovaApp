// Rova Time Format Extension
// Convert seconds to human-readable time formats

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova Time Format requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  function pad(n) {
    return String(Math.floor(n)).padStart(2, "0");
  }

  function format(seconds) {
    const s = Math.max(0, Math.floor(Cast.toNumber(seconds)));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return h + ":" + pad(m) + ":" + pad(sec);
    return m + ":" + pad(sec);
  }

  class RovaTime {
    getInfo() {
      return {
        id: "rovatime",
        name: "Time Format",
        color1: "#1565c0",
        color2: "#0d47a1",
        blocks: [
          {
            opcode: "toTimestamp",
            blockType: BlockType.REPORTER,
            text: "[SEC] seconds as timestamp",
            arguments: {
              SEC: { type: ArgumentType.NUMBER, defaultValue: 56 }
            }
          },
          {
            opcode: "toTimestampHours",
            blockType: BlockType.REPORTER,
            text: "[SEC] seconds as timestamp with hours",
            arguments: {
              SEC: { type: ArgumentType.NUMBER, defaultValue: 3661 }
            }
          },
          "---",
          {
            opcode: "toSeconds",
            blockType: BlockType.REPORTER,
            text: "timestamp [TIME] to seconds",
            arguments: {
              TIME: { type: ArgumentType.STRING, defaultValue: "1:23" }
            }
          }
        ]
      };
    }

    toTimestamp({ SEC }) {
      return format(SEC);
    }

    toTimestampHours({ SEC }) {
      const s = Math.max(0, Math.floor(Cast.toNumber(SEC)));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return h + ":" + pad(m) + ":" + pad(sec);
    }

    toSeconds({ TIME }) {
      const parts = Cast.toString(TIME).split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return parts[0] || 0;
    }
  }

  Scratch.extensions.register(new RovaTime());
})(Scratch);
