
# AWS Cognito Auth in Node-js using Express-js

A server site application which provide the login functionality with the help of aws cognito. Amazon Cognito lets you add user sign-up, sign-in, and access control to your web and mobile apps quickly and easily.


## References

 - [Create and SetUp User Pool](https://onexlab-io.medium.com/aws-cognito-node-js-cc05760b61c3)
 - [Video Tutorial](https://www.youtube.com/watch?v=W0cXpK6TlWE)
 - [AWS-Cognito Google SignIn Video Tutorial](https://www.youtube.com/watch?v=PkP2GB713rY)

To impliment SignIn with Google Functionality. Create  Google_SignIn_Link = `https://<YOUR_AWS_DOMAIN>/authorize?redirect_uri=<YOUR_REDIRECT-URL>&response_type=token&client_id=<AWS_CLIENT_ID>a&identity_provider=Google`

## Installation

To install and run this project on your local machine. follow the given instructions below:

a. Clone this repository.

```bash
  git clone https://github.com/RtjShreyD/Node-Express-Cognito-Auth.git
  cd Node-Express-Cognito-Auth
  npm install or npm i
```
b. Install the following dependencies.

```bash
  npm i amazon-cognito-identity-js
  npm i aws-sdk
  npm i body-parser
  npm i dotenv
  npm i ejs express nodemon
  npm i jwt-decode
  npm i node-fetch
``` 
c. Create a .env file and fill your aws-cognito credentials.

```bash
  AWS_COGNITO_USER_POOL_ID=ap-xxxxxxxxx
  AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxx
  AWS_COGNITO_REGION=xxxxxxxxxxxxx
  AWS_COGNITO_IDENTITY_POOL_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  Google_SignIn_Link=signin_with_google_link
```
d. To run the application.

```bash
  node index.js
```
After Successfully login to the application you see the following credentialsin your terminal/console.

```bash
  {
    statusCode: 200,
    response: {
      token: {
        accessToken: 'xxxxx-token-xxxxxx',
        idToken: 'xxxxx-token-xxxxxx',
        refreshToken: 'xxxxx-token-xxxxxx'
      },
      email: 'user@example.com',
      exp: 1659998003,
      uid: 'xxx-xxxx-xxxxx-xxxx',
      auth_time: 1659994403,
      token_use: 'id'
  }
}
```