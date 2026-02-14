const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            req.user = await User.findOne({ email: decoded.sub }).select('-password');

            if (!req.user) {
                return res.status(401).json({ detail: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ detail: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ detail: 'Not authorized, no token' });
    }
};

module.exports = { protect };
