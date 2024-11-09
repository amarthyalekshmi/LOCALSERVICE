const jwt = require('jsonwebtoken');

require('dotenv').config();
const CODE = process.env.JSON_KEY;

function authAdmin (req, res, next) {
    const adminToken = req.cookies.adminToken;

    if (!adminToken) {
        return res.redirect('/admin/login');
    }

    try {
        // verify and decode the token
        const admin = jwt.verify(adminToken, CODE);
        req.admin = admin;
        next();
        
    } catch (error) {
        res.clearCookie('adminToken');
        return res.redirect('/admin/login');
    }
}

module.exports = authAdmin;