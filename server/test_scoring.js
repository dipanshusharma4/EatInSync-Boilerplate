const { analyzeDish } = require('./services/compatibilityEngine');
const { getCanonicalIngredient } = require('./services/foodoscope');

// Mock Data
const userProfile = {
    taste: { sweet: 8, spicy: 2, bitter: 1, sour: 5, umami: 8, creamy: 8 },
    sensitivity: {
        allergies: ['Peanut', 'Shellfish'],
        intolerances: ['Lactose'],
        spiceTolerance: 'Low',
        fermentedSensitivity: true
    }
};

const flavorData = [
    { name: 'peanut butter', canonicalName: 'peanut', flavorProfile: 'sweet@nutty', functionalGroups: 'nut' },
    { name: 'shrimp', canonicalName: 'shrimp', flavorProfile: 'salty@umami', functionalGroups: 'seafood' },
    { name: 'milk', canonicalName: 'milk', flavorProfile: 'creamy', functionalGroups: 'dairy' },
    { name: 'chili', canonicalName: 'chili', flavorProfile: 'spicy', functionalGroups: 'spice' },
    { name: 'apple', canonicalName: 'apple', flavorProfile: 'sweet@sour', functionalGroups: 'fruit' }
];

console.log("--- Running Compatibility Engine Verification ---\n");

// Test 1: Allergy Block (Peanut)
const dish1 = { ingredients: [{ ingredient: 'Peanut Butter' }, { ingredient: 'Jelly' }] };
const result1 = analyzeDish(dish1, userProfile, flavorData);
console.log(`Test 1 (Allergy: Peanut): BioScore=${result1.bioScore}, Block=${result1.block}`);
if (result1.bioScore === 0 && result1.block === true) console.log("✅ PASS"); else console.log("❌ FAIL");

// Test 2: Intolerance (Lactose)
const dish2 = { ingredients: [{ ingredient: 'Milk' }, { ingredient: 'Cereal' }] };
const result2 = analyzeDish(dish2, userProfile, flavorData);
console.log(`Test 2 (Intolerance: Lactose): BioScore=${result2.bioScore}`);
if (result2.bioScore <= 70 && result2.bioScore > 0) console.log("✅ PASS"); else console.log("❌ FAIL");

// Test 3: Safe Dish (Apple)
const dish3 = { ingredients: [{ ingredient: 'Apple' }] };
const result3 = analyzeDish(dish3, userProfile, flavorData);
console.log(`Test 3 (Safe): BioScore=${result3.bioScore}`);
if (result3.bioScore === 100) console.log("✅ PASS"); else console.log("❌ FAIL (Score: " + result3.bioScore + ")");

// Test 4: Spice Tolerance (Low vs Chili)
const dish4 = { ingredients: [{ ingredient: 'Chili' }] };
const checkSpice = analyzeDish(dish4, userProfile, flavorData);
console.log(`Test 4 (Spice Tolerance): BioScore=${checkSpice.bioScore}`);
if (checkSpice.bioScore < 90) console.log("✅ PASS"); else console.log("❌ FAIL");

console.log("\n--- Comparison Complete ---");
