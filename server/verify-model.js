const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function verifyModel() {
    const modelName = "gemini-2.0-flash";
    console.log(`Verifying ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        console.log(`SUCCESS: ${result.response.text()}`);
    } catch (error) {
        console.error(`ERROR with ${modelName}:`, error.message);
    }
}

verifyModel();
