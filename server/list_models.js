
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
    console.log("Checking API Key availability...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No GEMINI_API_KEY in .env");
        return;
    }
    console.log(`Key found: ...${key.slice(-4)}`);

    try {
        // We will try to fetch the list of models using the REST API manually 
        // because the SDK wrapper for listModels might be tricky or same error.
        // Actually, let's try a simple fetch first.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        
        if (!response.ok) {
            console.error(`❌ API Request Failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error("Error Details:", errorText);
            return;
        }

        const data = await response.json();
        const models = data.models || [];
        console.log(`✅ Success! Found ${models.length} models.`);
        console.log("Available generation models:");
        models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name}`);
            }
        });

    } catch (error) {
        console.error("❌ Network or Script Error:", error.message);
    }
}

list();
