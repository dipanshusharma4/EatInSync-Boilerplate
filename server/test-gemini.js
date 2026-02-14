const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        const response = await axios.get(URL);
        const models = response.data.models
            .map(m => m.name.replace('models/', '')) // remove prefix
            .filter(n => n.includes('gemini'));

        fs.writeFileSync('output.txt', JSON.stringify(models, null, 2));
        console.log("Wrote models to output.txt");
    } catch (error) {
        fs.writeFileSync('output.txt', `Error: ${error.message}\n${error.response ? JSON.stringify(error.response.data) : ''}`);
        console.error("Error written to output.txt");
    }
}

listModels();
