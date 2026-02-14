const jwt = require('jsonwebtoken');

const generateToken = (id, email) => {
    return jwt.sign({ id, sub: email }, process.env.SECRET_KEY, {
        expiresIn: '24h' // Increased for better DX
    });
};

module.exports = generateToken;
