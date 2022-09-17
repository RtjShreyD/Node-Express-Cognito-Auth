const session = require('express-session')
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../jwks.json');
const pem = jwkToPem(jwk.keys[0]);

const userAuth = function (req, res, next) {
    const token = req.cookies["session-token"];
    if (token) {
        jwt.verify(token, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
            if (err) {
                console.log(err.message);
            } else {
                console.log('userAuth'+decodedToken.email)
                return res.decodedToken.email;
            }
        });
    } else {
        console.log('Error');
    }
}

module.exports = { userAuth };