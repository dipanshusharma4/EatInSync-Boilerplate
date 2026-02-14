const sharp = require('sharp');
const fs = require('fs');

(async () => {
    try {
        console.log("Testing Sharp...");
        // Create a simple blank image buffer
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 0.5 }
            }
        })
            .png()
            .toBuffer();

        console.log("Sharp buffer created, size:", buffer.length);
        console.log("Sharp is working correctly.");
    } catch (error) {
        console.error("Sharp failed:", error);
    }
})();
