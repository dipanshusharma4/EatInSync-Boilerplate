const { searchRecipes } = require('./services/foodoscope');

// Mock axios client if needed or run with real one
// Assuming foodoscope.js uses real API key from env or fallback

async function test() {
    console.log("--- Testing 'pe' ---");
    const res1 = await searchRecipes('pe');
    console.log(`Query 'pe' returned ${res1.length} results.`);
    if (res1.length > 0) console.log("Example:", res1[0].Recipe_title);

    console.log("\n--- Testing 'peanut' (lowercase) ---");
    const res2 = await searchRecipes('peanut');
    console.log(`'peanut' returned ${res2.length} results.`);

    console.log("\n--- Testing 'Peanut' (Capitalized) ---");
    const res3 = await searchRecipes('Peanut');
    console.log(`'Peanut' returned ${res3.length} results.`);
    
    if (res2.length !== res3.length) {
        console.warn("WARNING: API results differ by case!");
    } else {
        console.log("Case sensitivity check passed (same count).");
    }
}

test();
