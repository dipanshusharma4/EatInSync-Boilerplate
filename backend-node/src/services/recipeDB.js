const axios = require('axios');

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
    };
};

const getRecipeInfo = async (page = 1, limit = 5) => {
    const url = `${process.env.RECIPE_BASE_URL}/recipe/recipesinfo`;
    const params = { page, limit };

    try {
        const { data } = await axios.get(url, {
            params,
            headers: getHeaders()
        });
        return data;
    } catch (error) {
        console.error(`RecipeDB Error: ${error.message}`);
        return null;
    }
};

const getNutritionInfo = async (page = 1, limit = 5) => {
    const url = `${process.env.RECIPE_BASE_URL}/recipe-nutri/nutritioninfo`;
    const params = { page, limit };

    try {
        const { data } = await axios.get(url, {
            params,
            headers: getHeaders()
        });
        return data;
    } catch (error) {
        console.error(`RecipeDB Nutrition Error: ${error.message}`);
        return null;
    }
};

module.exports = { getRecipeInfo, getNutritionInfo };
