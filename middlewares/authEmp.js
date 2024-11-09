const jwt = require('jsonwebtoken');

require('dotenv').config();
const CODE = process.env.JSON_KEY;

function authEmp (req, res, next) {
    const empToken = req.cookies.empToken;

    if (!empToken) {
        return res.redirect('/emp/login');
    }

    try {
        // verify and decode the token
        const emp = jwt.verify(empToken, CODE);
        req.emp = emp;
        next();
        
    } catch (error) {
        res.clearCookie('empToken');
        return res.redirect('/emp/login');
    }
}

module.exports = authEmp;