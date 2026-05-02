class DataURLType {
    getInfo() {
        return {
            id: 'dataurltype',
            name: 'Data URL Type',
            blocks: [
                {
                    opcode: 'getType',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'type of data URL [URL]',
                    arguments: {
                        URL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'data:image/png;base64,iVBORw0KGgo='
                        }
                    }
                }
            ]
        };
    }

    getType(args) {
        const url = args.URL;

        if (!url.startsWith("data:")) {
            return "not a data url";
        }

        try {
            // Extract MIME type
            const mime = url.split(";")[0].split(":")[1];

            if (!mime) return "unknown";

            if (mime.startsWith("image/")) return "image";
            if (mime.startsWith("video/")) return "video";
            if (mime.startsWith("audio/")) return "audio";
            if (mime.startsWith("text/")) return "text";

            if (mime === "application/json") return "json";
            if (mime === "application/pdf") return "pdf";

            return "other (" + mime + ")";
        } catch (e) {
            return "invalid data url";
        }
    }
}

Scratch.extensions.register(new DataURLType());
