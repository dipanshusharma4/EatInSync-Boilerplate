
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);

    const modelsToTest = ["gemini-flash-latest"];

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say Hello");
            const response = await result.response;
            console.log(`✅ ${modelName} Works! Response: ${response.text()}`);
        } catch (error) {
            console.error(`❌ ${modelName} Failed:`, error.message);
        }
        console.log("---");
    }
}

testModels();
