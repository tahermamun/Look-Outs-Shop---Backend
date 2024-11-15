# Getting Started

## Developer Experience

-   Nodejs
-   Express
-   MongoDB
-   Mongoose
-   Postman

## Project setup for `Development`

1. We will use `yarn` as our package manager. So, install it by running the `command` bellow.

```bash
npm i -g yarn
```

2. Install `eslint` and `prettier` extension in your `vscode`.

3. Install `Postman` app on your computer.

4. Clone project on your local machine by running `git clone https://github.com/Solutya/eCommerce-be`

5. Go to the project directory `eCommerce-be` and run `yarn` then `yarn prepare`.

6. Create `.env` file in your root directory.Then copy the contents of `.env.example` to `.env`.

7. Finally run `yarn dev` to start the dev server.

8. API Documentation `https://documenter.getpostman.com/view/16600453/2s93RMUaew`

**ENV**
`PORT=8000`
`NODE_ENV=development`
`MONGO_URI=`

`JWT_SECRET=`
`JWT_EXPIRES_IN=3d`
`COOKIE_EXPIRE=5`

`SERVICE=gmail`
`MAIL=`
`PASSWORD=`

`EMAIL_SUBJECT="Do not share your OTP Sended from LOGO"`
