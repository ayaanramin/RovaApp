class SymmetricPair {
    getInfo() {
        return {
            id: 'symmetricpair',
            name: 'Symmetric Pair',
            blocks: [
                {
                    opcode: 'pair',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'pair [A] with [B]',
                    arguments: {
                        A: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'apple'
                        },
                        B: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'banana'
                        }
                    }
                }
            ]
        };
    }

    pair(args) {
        let a = String(args.A);
        let b = String(args.B);

        // Sort to guarantee same order
        let sorted = [a, b].sort();

        // Join with separator
        return sorted[0] + "|" + sorted[1];
    }
}

Scratch.extensions.register(new SymmetricPair());
