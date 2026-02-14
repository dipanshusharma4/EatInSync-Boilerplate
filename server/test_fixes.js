const { analyzeDish } = require('./services/compatibilityEngine');

// Mock Data
const userProfile = {
    taste: { sweet: 1, spicy: 1, bitter: 1, sour: 1, umami: 1, creamy: 5 },
    sensitivity: {
        allergies: ['Peanut'],
        intolerances: ['Gluten'],
        spiceTolerance: 'Low',
        fermentedSensitivity: true
    }
};

const flavorData = [
    { name: 'soy sauce', canonicalName: 'soy sauce', flavorProfile: 'salty@umami', functionalGroups: 'condiment' },
    { name: 'pork', canonicalName: 'pork', flavorProfile: 'savory', functionalGroups: 'meat' }
];

console.log("--- Running Fix Verification ---\n");

// Scenario: "Thai Peanut Pork" - Ingredient list might NOT have "peanut" explicitly if data is poor, 
// but Title has it. Also contains Soy Sauce (Gluten).
const dish = { 
    dishName: "Slow Cooker Thai Peanut Pork",
    ingredients: [
        { ingredient: 'Pork' }, 
        { ingredient: 'Soy Sauce' }, 
        { ingredient: 'Red Pepper' }
    ] 
};

// 1. Analyze
const result = analyzeDish(dish, userProfile, flavorData);

console.log(`Dish: ${dish.dishName}`);
console.log(`BioScore: ${result.bioScore}`);
console.log(`Blocked: ${result.block}`);
console.log(`Warnings:`);
result.warnings.forEach(w => console.log(` - ${w}`));

// Verifications
const titleCheckPass = result.block === true && result.warnings.some(w => w.includes('in dish name'));
const glutenCheckPass = result.warnings.some(w => w.includes('Contains **gluten**') || w.includes('Contains **soy sauce**'));

if (titleCheckPass) console.log("\n✅ PASS: Title-based Peanut Allergy caught.");
else console.log("\n❌ FAIL: Title-based Allergy MISSED.");

if (glutenCheckPass) console.log("✅ PASS: Hidden Gluten in Soy Sauce caught.");
else console.log("❌ FAIL: Hidden Gluten MISSED.");

console.log("\n--- Verification Complete ---");
