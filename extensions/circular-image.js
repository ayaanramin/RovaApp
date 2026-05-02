(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  class CircularImage {
    getInfo() {
      return {
        id: 'circularimageext',
        name: 'Circular Image',
        color1: '#00bcd4',
        color2: '#0097a7',
        blocks: [
          {
            opcode: 'makeCircular',
            blockType: Scratch.BlockType.REPORTER,
            text: 'make circular image from [URL] size [SIZE]',
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://extensions.turbowarp.org/dango.png',
              },
              SIZE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 256,
              },
            },
          },
        ],
      };
    }

    async makeCircular({ URL, SIZE }) {
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL;
      });

      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = SIZE;
      canvas.height = SIZE;

      // Draw circular mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Draw image centered and scaled
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, SIZE, SIZE);
      ctx.restore();

      // Return as Data URL
      return canvas.toDataURL('image/png');
    }
  }

  Scratch.extensions.register(new CircularImage());
})(Scratch);
