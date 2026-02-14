const jwt = require('jsonwebtoken');

const generateToken = (id, email) => {
    return jwt.sign({ id, sub: email }, process.env.SECRET_KEY, {
        expiresIn: '30m' // Matching Python ACCESS_TOKEN_EXPIRE_MINUTES=30
    });
};

module.exports = generateToken;
