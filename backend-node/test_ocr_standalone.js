const Tesseract = require('tesseract.js');

(async () => {
    try {
        console.log("Starting Tesseract test...");
        // Use a simple hosted image for testing
        const { data: { text } } = await Tesseract.recognize(
            'https://tesseract.projectnaptha.com/img/eng_bw.png',
            'eng',
            { logger: m => console.log(m) }
        );
        console.log("Result:", text);
    } catch (error) {
        console.error("Test Failed:", error);
    }
})();
