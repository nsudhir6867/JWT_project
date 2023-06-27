const createError = require("http-errors");
const User = require("../Models/User.model");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt");
const redisClient = require("../helpers/init_redis");

exports.register = async (req, res, next) => {
  console.log(req.body);
  try {
    const result = await authSchema.validateAsync(req.body);

    const doesExist = await User.findOne({ email: result.email });
    if (doesExist) {
      throw createError.Conflict(
        `Email already registered with password xyz, JK`
      );
    }

    // const user = new User({ email, password });
    const user = new User(result);
    const savedUser = await user.save();

    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);
    res.send({ accessToken, refreshToken });
  } catch (err) {
    console.log(err);
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

exports.login = async (req, res, next) => {
  console.log("login");
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });
    if (!user) throw createError.NotFound("User is not registered");
    const doesPassMatch = await user.isValidPassword(result.password);
    if (!doesPassMatch) {
      throw createError.Unauthorized("Username/Password is not valid");
    }
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true) {
      return next(createError.BadRequest("Invalid Username/Password"));
    }
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const newAccessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.send({ accessToken: newAccessToken, refreshToken: newAccessToken });
  } catch (error) {}
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest("For Debug- No Refresh");
    const userId = await verifyRefreshToken(refreshToken);
    redisClient
      .del(userId)
      .then((reply) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err.message);
        throw createError.InternalServerError("For Debug- Internal error");
      });
  } catch (error) {
    next(error);
  }
};
