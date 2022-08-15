'use strict';
global.fetch = require('node-fetch');

require('dotenv').config();
const Cognito = require('./cognito/index');
const { verify } = require('./cognito/index');
const express = require('express');
const req = require('express/lib/request');
const path = require("path");
const bodyParser = require('body-parser');
const { response } = require('express');



const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());



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

app.post('/auth/user', async function(req,res){
    const response = await Cognito.onSignIn();
    console.log(response);
})

app.post('/auth/signin', async function (req, res) {
    let useremail = req.body.email;
    let userpassword = req.body.password;
    const response = await Cognito.signIn(`${useremail}`, `${userpassword}`);

    if (response.statusCode === 200) {
        res.redirect(`/dashboard/#access_token=${response.response.token.accessToken}`);
    } else if(response.statusCode === 400 && response.response === 'User is not confirmed.'){
        res.redirect(`/auth/verify/user_id=${useremail}`);
    }else {
        res.end("You are not register please register first");
    }
    console.log(response);
});

app.post('/logout', async (req, res) => {
    try {
        await Auth.signOut({ global: true });
    } catch (error) {
        console.log('error signing out: ', error);
    }
});

app.get('/dashboard/:code', (req, res) => {
    res.render('dashboard',{email: req.email});
})
app.get('/dashboard/', (req, res) => {
    res.render('dashboard',{email: req.email});
})
app.get('/auth/verify/user_id=:email', (req,res) => {
    res.render('verify',{ title: "Verifying user", email: req.params['email'] });
});
app.get('/signup', (req,res) => {
    res.render('signup',{ title: "SignUp User", googlelink: process.env.Google_SignIn_Link });
});

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('assets', express.static(path.join(__dirname, 'public/assets')))

app.get('/', (req, res) => {
    res.render('base', { title: "Login System", googlelink: process.env.Google_SignIn_Link })
});

const port = 3001;
app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port: ${port}`);
});