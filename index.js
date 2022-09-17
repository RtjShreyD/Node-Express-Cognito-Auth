'use strict';
global.fetch = require('node-fetch');

require('dotenv').config();
const Cognito = require('./cognito/index');
// const { verify } = require('./cognito/index');
const express = require('express');
// const req = require('express/lib/request');
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session')
// const { response } = require('express');
const userModel = require('./database');
const mongoose = require('mongoose');
// const url = require('url')
const Razorpay = require('razorpay')
const questions = require("../node-cognito-test/questions.json");
var order_id, order_status = null;
// const router = require("./routes");
const crypto = require("crypto");
const cookieParser = require('cookie-parser')
const { requireAuth } = require('./middleware/verifytoken');
const { hasPaidCheck } = require('./middleware/hasPaid');
const emailjs = require('emailjs-com')
const e = require('express');
const { url } = require('inspector');
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
// const userAuth = require('./config/config');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jwk = require('./jwks.json');
const pem = jwkToPem(jwk.keys[0]);




const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }))
app.locals.pretty = true;

const userDetails = {
    email: "null",
    accessToken: "null",
    idToken: "null",
}

app.use(cookieParser())

// app.get('/', function (req, res) {
//   // Cookies that have not been signed
//   console.log('Cookies: ', req.cookies)

//   // Cookies that have been signed
//   console.log('Signed Cookies: ', req.cookies["session-token"])
// })

// App Config
const connection_url = "mongodb+srv://admin:admin@cluster0.o2wbvrd.mongodb.net/?retryWrites=true&w=majority";

// DB Config
mongoose.connect(connection_url, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log('connected to db')
}).catch((error) => {
    console.log(error)
})

// app.use(router);





app.post('/request', function (req, res) {

    userDetails.idToken = req.body.token;
    // console.log(userDetails.idToken);
    res.cookie("session-token", userDetails.idToken);
    userDetails.email = req.body.email;
    console.log(userDetails.email);
    res.end();
});


// app.use(flash());
app.get('/dashboard/', requireAuth, function (req, res, next) {
    var user;
    const token = req.cookies["session-token"];
    if (token) {
        jwt.verify(token, pem, { algorithms: ['RS256'] }, function (err, decodedToken) {
            if (err) {
                console.log(err.message);
            } else {
                user = decodedToken.email;
            }
        });
    } else {
        console.log('Error');
    }
    // const userEmail = userAuth.userAuth;
    console.log('message '+user);
    userModel.find({email: user}, function(err, doc){
        if(err){
            console.log(err);
        }else{
            console.log('show' + doc);
            res.render("dashboard", {
                            data: doc, title: "Dashboard"
                        });
        }
    })
    // console.log(user);
    // res.render("dashboard", { user, title: "Dashboard"});
});

app.get('/list', function (req, res, next) {

    userModel.find((err, docs) => {
        if (!err) {
            res.render("list", {
                data: docs
            });
        } else {
            console.log('Failed to retrieve the Course List: ' + err);
        }
    });
});

app.get('/test', requireAuth, (req, res) => {
    res.render('test', { title: "Test" });
});

app.post('/dashboard', (req, res) => {
        // Name = req.body.name,
        // email = req.body.email,
        // phoneNumber = req.body.phoneNumber,
        // age = req.body.age,
        // gender = req.body.gender
    let newAddress = new userModel({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        age: req.body.age,
        gender: req.body.gender
    })
    newAddress.save().then((address) => {
        res.redirect('/dashboard/')
    }).catch((err) => {
        console.log(err)
    })
})


app.post('/auth/signup', async function (req, res) {
    let useremail = req.body.email;
    let userpassword = req.body.password;
    const response = await Cognito.signUp(`${useremail}`, `${userpassword}`);
    res.redirect(`/auth/verify/user_id=${useremail}`);
    console.log(response);
});

app.post('/auth/verify/user_id=:email', async function (req, res) {
    let usercode = req.body.verify;
    const response = await Cognito.verify(req.params['email'], `${usercode}`);
    if (response.statusCode === 400) {
        res.redirect('/dashboard');
    }
    console.log(response);
});

app.post('/auth/user', async function (req, res) {
    const response = await Cognito.onSignIn();
    console.log(response);
})

app.post('/auth/signin', async function (req, res) {
    let useremail = req.body.email;
    let userpassword = req.body.password;
    const response = await Cognito.signIn(`${useremail}`, `${userpassword}`);


    if (response.statusCode === 200) {
        console.log(response);
        // userDetails.name = response.response.name;
        userDetails.email = response.response.email;
        userDetails.accessToken = response.response.token.accessToken;
        userDetails.idToken = response.response.token.idToken;
        res.cookie("session-token", userDetails.idToken);
        // res.status(200).end();
        res.redirect(`/dashboard/#access_token=${response.response.token.accessToken}`);
    } else if (response.statusCode === 400 && response.response === 'User is not confirmed.') {
        res.redirect(`/auth/verify/user_id=${useremail}`);
    } else if (response.statusCode === 400 && response.response === 'Incorrect username or password.') {
        res.render('base', { title: "Login System", googlelink: process.env.Google_SignIn_Link, message: 'Incorrect username or password.' });
        // res.end("Invalid user and password");
    } else if (response.statusCode === 400 && response.response === 'Password attempts exceeded') {
        res.render('base', { title: "Login System", googlelink: process.env.Google_SignIn_Link, message: 'Password attempts exceeded' });
    }

    console.log(response);
});
app.get('/auth/verify/user_id=:email', (req, res) => {
    res.render('verify', { title: "Verifying user", email: req.params['email'] });
});
app.get('/signup', (req, res) => {
    res.render('signup', { title: "SignUp User", googlelink: process.env.Google_SignIn_Link });
});


app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('assets', express.static(path.join(__dirname, 'public/assets')))

app.get('/session-expire', (req,res) => {
    res.render('timeout', { title: "Session Expire"})
})
app.get('/', (req, res) => {
    if (req.cookies["session-token"]) {
        // console.log(requireAuth);
        res.redirect('/dashboard/');
        // res.render('timeout', { title: "Session Expire"})
    } else{
        res.render('base', { title: "Login System", googlelink: process.env.Google_SignIn_Link, message: "null" })
    }
});

app.use(function (req, res, next) {
    if (userDetails.islogin == false) {
        // if user is not logged-in redirect back to login page //
        res.redirect('/');
    } else {
        next();
    }
});

app.get('/ment/payment', requireAuth, (req, res) => {
    // ///////// Payment ///////////////
    console.log("Else condition")

    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })

    var options = {
        amount: 199 * 100,
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    instance.orders.create(options, function (err, order) {
        console.log(order);
        order_id = order.id;
    });
    // }
    res.render('ment', { title: "Ment", key: process.env.RAZORPAY_KEY_ID, orderID: order_id, payment_success: order_status, options: options });
});

app.post("/api/payment/verify", async (req, res) => {

    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpaySignature)
        return res
            .status(400)
            .json({ success: false, data: { message: "Transaction invalid" } });

    const userDoc = await User.findOne({ email: userDetails.email });
    userDoc.hasPaid = true;
    userDoc.save();

    res.json({
        success: true,
        data: {
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        },
    });
});

app.get('/test-questions', requireAuth, hasPaidCheck, (req, res) => {
    res.render("questions", { title: 'Ment Test', questions, userEmail: userDetails.email });
})



app.post('/logout', (req, res) => {
    res.clearCookie('session-token');
    userDetails.email = 'null';
    userDetails.accessToken = "null";
    userDetails.idToken = "null";
    // res.end();
    res.redirect('/');
});
app.post('/submit-answers', function (req, res) {
    const personalityType = getPersonalityType(req.body);
    const fileName = getFileName(personalityType);

    const pdfFilePath = path.join(__dirname, "..", "..", "pdfs", fileName);
    console.log(personalityType);
    console.log(fileName);
    console.log(pdfFilePath);
    // const data = {
    //     url: url,
    //     email: req.email,
    // }
    // // emailjs.send('service_c6bjhph', 'template_cl1jp1x', email, 'user_FeEMN7kk8LhridH9lle0F');
    // emailjs.send('service_c6bjhph', 'template_cl1jp1x', data, 'user_FeEMN7kk8LhridH9lle0F')
    //     .then(function (response) {
    //         console.log('SUCCESS!', response.status, response.text);
    //     }, function (err) {
    //         console.log('FAILED...', err);
    //     });
    // var data = {
    //     service_id: 'service_c6bjhph',
    //     template_id: 'template_cl1jp1x',
    //     user_id: 'user_FeEMN7kk8LhridH9lle0F',
    //     template_params: {
    //         'email': userDetails.email,
    //         'attachement': [
    //             { data: fileName, name: fileName }
    //             , { path: pdfFilePath, name: fileName }]
    //     }
    // };

    // $.ajax('https://api.emailjs.com/api/v1.0/email/send', {
    //     type: 'POST',
    //     data: JSON.stringify(data),
    //     contentType: 'application/json'
    // }).done(function () {
    //     // alert('Your mail is sent!');
    //     console.log('Your mail is sent!')
    // }).fail(function (error) {
    //     console.log('Oops... ' + JSON.stringify(error));
    // });
    // res.end();


    let nodemailer = require('nodemailer');
    let AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: 'AKIA257IEHTAYM6VG4HF',
        secretAccessKey: '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',
        region: 'us-east-1',
    });
    let transporter = nodemailer.createTransport({
        SES: new AWS.SES({
            apiVersion: '2010-12-01'
        })
    });
    transporter.sendMail({
        from: 'info.mentconsult@gmail.com',
        to: userDetails.email,
        subject: 'Personality test report | Ment Consulting',
        text: 'Your Test Report is ready please find the attachment below!',
        attachments: [
            { filename: fileName, path: `./pdfs/${fileName}` }
        ]
    }, (err, info) => {
        if(!err){
            console.log(info.envelope);
            console.log(info.messageId);
        }else{
            console.log('FAILED.....' + err);
        }
    });
})

function getPersonalityType(ans) {
    const EorI = ["1", "8", "15", "22", "29", "36", "43", "50", "57", "64"];

    const SorN = [
        "2",
        "9",
        "16",
        "23",
        "30",
        "37",
        "44",
        "51",
        "58",
        "65",
        "3",
        "10",
        "17",
        "24",
        "31",
        "38",
        "45",
        "52",
        "59",
        "66",
    ];

    const TorF = [
        "4",
        "11",
        "18",
        "25",
        "32",
        "39",
        "46",
        "53",
        "60",
        "67",
        "5",
        "12",
        "19",
        "26",
        "33",
        "40",
        "47",
        "54",
        "61",
        "68",
    ];

    const JorP = [
        "6",
        "13",
        "20",
        "27",
        "34",
        "41",
        "48",
        "55",
        "62",
        "69",
        "7",
        "14",
        "21",
        "28",
        "35",
        "42",
        "49",
        "56",
        "63",
        "70",
    ];

    let response = "";

    response += getType(ans, EorI, "E", "I");
    response += getType(ans, SorN, "S", "N");
    response += getType(ans, TorF, "T", "F");
    response += getType(ans, JorP, "J", "P");

    return response;
}

function getPersonalityType(ans) {
    const EorI = ["1", "8", "15", "22", "29", "36", "43", "50", "57", "64"];

    const SorN = [
        "2",
        "9",
        "16",
        "23",
        "30",
        "37",
        "44",
        "51",
        "58",
        "65",
        "3",
        "10",
        "17",
        "24",
        "31",
        "38",
        "45",
        "52",
        "59",
        "66",
    ];

    const TorF = [
        "4",
        "11",
        "18",
        "25",
        "32",
        "39",
        "46",
        "53",
        "60",
        "67",
        "5",
        "12",
        "19",
        "26",
        "33",
        "40",
        "47",
        "54",
        "61",
        "68",
    ];

    const JorP = [
        "6",
        "13",
        "20",
        "27",
        "34",
        "41",
        "48",
        "55",
        "62",
        "69",
        "7",
        "14",
        "21",
        "28",
        "35",
        "42",
        "49",
        "56",
        "63",
        "70",
    ];

    let response = "";

    response += getType(ans, EorI, "E", "I");
    response += getType(ans, SorN, "S", "N");
    response += getType(ans, TorF, "T", "F");
    response += getType(ans, JorP, "J", "P");

    return response;
}

function getType(ans, arr, typeA, typeB) {
    let A = 0;
    let B = 0;

    for (let i = 0; i < arr.length; i += 1) {
        const questionNumber = arr[i];
        if (ans[questionNumber] === "1") A += 1;
        else B += 1;
    }

    if (A >= B) return typeA;
    return typeB;
}

function getFileName(personalityType) {
    const mapping = {
        ISTP: "The Craftsman.pdf",
        ISTJ: "The Inspector.pdf",
        ISFP: "The Composer.pdf",
        ISFJ: "The Protector.pdf",
        INTP: "The Architect.pdf",
        INTJ: "The Mastermind.pdf",
        INFP: "The Healer.pdf",
        INFJ: "The Counsellor.pdf",
        ESTP: "The Dynamo.pdf",
        ESTJ: "The Supervisor.pdf",
        ESFP: "The Performer.pdf",
        ESFJ: "The Provider.pdf",
        ENTP: "The Visionary.pdf",
        ENTJ: "The Commander.pdf",
        ENFP: "The Champion.pdf",
        ENFJ: "The Teacher.pdf",
    };

    return mapping[personalityType];
}

const port = 3001;
app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port: ${port}`);
});