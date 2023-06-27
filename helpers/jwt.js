const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const redisClient = require("./init_redis");

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "1h",
        issuer: "mywebsite.com",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "mywebsite.com", //Only this one
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
        redisClient
          .set(userId, token, "EX", 365 * 24 * 60 * 60)
          .then((reply) => {
            resolve(token);
          })
          .catch((err) => {
            console.log(err.message);
            reject(createError.InternalServerError());
          });
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return next(createError.Unauthorized());
    const [bearer, token] = authHeader.split(" ");
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const msg =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(msg));
      }
      req.payload = payload;
      next();
    });
  },

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) throw createError.Unauthorized();
          const userId = payload.aud;
          redisClient
            .get(userId)
            .then((userToken) => {
              if (refreshToken === userToken) return resolve(userId);
              reject(createError.Unauthorized());
            })
            .catch((err) => {
              console.log(err.message);
              return reject(createError.InternalServerError());
            });
        }
      );
    });
  },
};
