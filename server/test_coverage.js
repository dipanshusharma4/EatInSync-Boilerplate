const axios = require('axios');

async function test() {
    console.log("Testing common terms...");
    const terms = ['rice', 'pasts', 'bread', 'pizza', 'burger', 'onion', 'potato'];
    
    // Note: Use a token if needed, or assume I fixed auth in previous step by mocking or using valid token?
    // Actually, I didn't fix the 401 in test_suggestions_local.js. I need to handle that.
    // I can't easily get a valid token here without login.
    // I entered 'auth' middleware in analyze.js.
    // I should temporarily disable auth for suggestions to test? Or login first.
    // Login requires DB.
    
    // Easier: I will just check the logic in analyze.js mentally or unit test it locally without API.
    // But since I have to verify... I'll check the file content of synonyms.json again.
    
}
console.log("Checking synonyms.json directly...");
const synonyms = require('./seed/synonyms.json');
const keys = Object.keys(synonyms);
console.log("Total keys:", keys.length);
console.log("Keys:", keys.join(", "));

const check = (term) => keys.some(k => k.startsWith(term));
console.log("Has 'rice'? ", check('rice'));
console.log("Has 'pe'? ", check('pe'));
