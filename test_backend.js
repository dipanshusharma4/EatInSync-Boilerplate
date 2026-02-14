const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';

const runTest = async () => {
    try {
        console.log('--- Testing Backend ---');

        // 1. Register User
        const email = `testuser_${Date.now()}@example.com`;
        console.log(`\n1. Registering user: ${email}`);
        try {
            const res = await axios.post(`${BASE_URL}/auth/register`, {
                name: 'Test User',
                email,
                password: 'password123'
            });
            token = res.data.token;
            console.log('✅ Registration Successful. Token received.');
        } catch (e) {
            console.error('❌ Registration Failed:', e.response?.data || e.message);
            return;
        }

        // 2. Create Profile
        console.log('\n2. Creating Profile...');
        try {
            await axios.post(`${BASE_URL}/profile`, {
                taste: { spicy: 8, sweet: 2 },
                sensitivity: { allergies: ['Peanuts'], spiceTolerance: 'High' }
            }, { headers: { 'x-auth-token': token } });
            console.log('✅ Profile Created.');
        } catch (e) {
            console.error('❌ Profile Creation Failed:', e.response?.data || e.message);
        }

        // 3. Analyze Dish (Mock/Real)
        console.log('\n3. Analyzing Dish: "Spicy Peanut Noodles"...');
        try {
            const res = await axios.post(`${BASE_URL}/analyze`, {
                dishName: "Spicy Peanut Noodles",
                ingredients: ["Peanuts", "Chili Oil", "Noodles"]
            }, { headers: { 'x-auth-token': token } });
            
            const { tasteScore, bioScore, warnings, breakdown } = res.data.analysis;
            console.log('✅ Analysis Result:');
            console.log(`   - Taste Score: ${tasteScore} (Expected high due to Spicy preference)`);
            console.log(`   - Bio Score: ${bioScore} (Expected low due to Peanut allergy)`);
            console.log('   - Warnings:', warnings);
            console.log('   - Breakdown:', breakdown);

            if (bioScore === 0 && warnings.some(w => w.includes('Peanuts'))) {
                console.log('✅ LOGIC VERIFIED: Allergy detection works.');
            } else {
                console.log('⚠️ LOGIC WARNING: Allergy detection might be off.');
            }

        } catch (e) {
            console.error('❌ Analysis Failed:', e.response?.data || e.message);
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
};

runTest();
