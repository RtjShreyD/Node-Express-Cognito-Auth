const session = require('express-session')
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk  = require('../jwks.json');
const pem = jwkToPem(jwk.keys[0]);

const requireAuth = (req, res, next) => {
    const token = req.cookies["session-token"];
    if(token){
        jwt.verify(token, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
            if(err){
                if(err.message == 'jwt expired'){
                    console.log(err.message);
                    res.redirect('/session-expire')
                    // res.send(err);
                    return;
                }
                res.redirect('/');
            }else{
                console.log(decodedToken);
                next();
            }
        });
    }else{
        res.redirect('/');
    }
}

module.exports = { requireAuth };