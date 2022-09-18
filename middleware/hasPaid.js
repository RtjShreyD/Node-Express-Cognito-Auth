const session = require('express-session')
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('../jwks.json');
const pem = jwkToPem(jwk.keys[0]);
const user = require('../database');
const mongoose = require('mongoose');

const hasPaidCheck = (req, res, next) => {
    const token = req.cookies["session-token"];
    if (token) {
        jwt.verify(token, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
            if (err) {
                console.log(err.message);
                res.redirect('/');
            } else {
                // console.log(decodedToken);
                // console.log(decodedToken.email);
                mongoose.connect('mongodb+srv://admin:admin@cluster0.o2wbvrd.mongodb.net/?retryWrites=true&w=majority', function (err, db) {
                    if (err) throw err;
                    var collection = db.collection('users');

                    // does user exist
                    collection.findOne({ email: decodedToken.email }, function (err, doc) {
                        if (err) throw err;
                        if (doc) {
                            // console.log("this is doc"+doc);
                            if (doc.hasPaid == true) {
                                next();
                            } else {
                                res.redirect('/ment/payment');
                            }
                        }
                        else
                            res.redirect('/ment/payment');
                        db.close();
                    });
                });
            }
        });
    } else {
        res.redirect('/ment/payment');
    }
}

module.exports = { hasPaidCheck };