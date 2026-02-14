const axios = require('axios');

const getHeaders = () => {
    // FlavorDB required double Bearer prefix in Python code? Sticking to it.
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer Bearer ${process.env.API_KEY}`
    };
};

const getMoleculesByFlavor = async (flavor_profile) => {
    const url = `${process.env.FLAVOR_BASE_URL}/molecules_data/by-flavorProfile`;
    const params = { flavor_profile };

    try {
        const { data } = await axios.get(url, {
            params,
            headers: getHeaders()
        });
        return data;
    } catch (error) {
        console.error(`FlavorDB Molecule Error: ${error.message}`);
        return [];
    }
};

const getAromaThreshold = async (threshold_value = 1.0) => {
    const url = `${process.env.FLAVOR_BASE_URL}/properties/by-aromaThresholdValues`;
    const params = { threshold: threshold_value };

    try {
        const { data } = await axios.get(url, {
            params,
            headers: getHeaders()
        });
        return data;
    } catch (error) {
        console.error(`FlavorDB Threshold Error: ${error.message}`);
        return [];
    }
};

const checkFlavorPairing = async (food_pair) => {
    const url = `${process.env.FLAVOR_BASE_URL}/food/by-alias`;
    const params = { food_pair };

    try {
        const { data } = await axios.get(url, {
            params,
            headers: getHeaders()
        });
        return data;
    } catch (error) {
        console.error(`FlavorDB Pairing Error: ${error.message}`);
        return null;
    }
};

module.exports = {
    getMoleculesByFlavor,
    getAromaThreshold,
    checkFlavorPairing
};
