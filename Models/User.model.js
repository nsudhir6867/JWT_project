const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
    // console.log(this.email, this.password);
    // console.log("Called before saving a user");
  } catch (err) {
    next(err);
  }
});

// UserSchema.post("save", async function () {
//   try {
//     console.log("Called after saving a user");
//   } catch (err) {
//     next(err);
//   }
// });

const User = mongoose.model("user", UserSchema);
module.exports = User;
