(function (Scratch) {
  "use strict";

  class IsOnlySpaces {
    getInfo() {
      return {
        id: "isOnlySpaces",
        name: "Space Check",
        color1: "#4a90d9",
        blocks: [
          {
            opcode: "isOnlySpaces",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "[INPUT] is only spaces?",
            arguments: {
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: " ",
              },
            },
          },
          {
            opcode: "isEmptyOrSpaces",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "[INPUT] is empty or only spaces?",
            arguments: {
              INPUT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: " ",
              },
            },
          },
        ],
      };
    }

    // True only if the string is 1+ characters and ALL of them are spaces
    isOnlySpaces({ INPUT }) {
      const s = String(INPUT);
      return s.length > 0 && s.trim().length === 0;
    }

    // True if the string is empty OR contains only spaces
    isEmptyOrSpaces({ INPUT }) {
      return String(INPUT).trim().length === 0;
    }
  }

  Scratch.extensions.register(new IsOnlySpaces());
})(Scratch);