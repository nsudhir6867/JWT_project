const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
require("./helpers/mongodb");
const { verifyAccessToken } = require("./helpers/jwt");
const app = express();
const AuthRoute = require("./Routes/Auth.route");

app.use(morgan("dev"), express.json(), express.urlencoded({ extended: true }));

app.get("/", verifyAccessToken, async (req, res, next) => {
  res.send("Hello from server");
});

app.use("/auth", AuthRoute);

app.use(async (req, res, next) => {
  //   const error = new Error("Not found!");
  //   error.status = 404;
  //   next(error); //It is handled by the below error handler

  //   above code in simple using http-errors
  next(createError.NotFound());
});

app.use(async (error, req, res, next) => {
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Listening to port ", PORT);
});
