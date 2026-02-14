const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/analyze/suggestions?q=pe');
        console.log("Suggestions for 'pe':", res.data);
        
        if (res.data.some(s => s.type === 'ingredient')) {
            console.log("SUCCESS: Local ingredient suggestions returned.");
        } else {
            console.log("FAILURE: No local ingredient suggestions.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

test();
