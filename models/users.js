const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    minLength: [4, "Invalid length, minimum is 4 characters"],
    maxLength: [32, "Invalid length, maximum is 32 characters"],
  },
  email: {
    type: String,
    minLength: [4, "Invalid length, minimum is 4 characters"],
    maxLength: [32, "Invalid length, maximum is 32 characters"],
    unique: true,
    lowercase: true,
    required: "Email is required",
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ],
  },
  password: {
    type: String,
    minLength: [4, "Invalid length, minimum is 4 characters"],
    maxLength: [32, "Invalid length, maximum is 32 characters"],
    required: "Password is required",
  },
});

userSchema.methods.hasSamePassword = function (providedPassword) {
  // Boolean, 'this' contains the user data
  return bcrypt.compareSync(providedPassword, this.password);
};

// BEFORE (pre) saving data execute this function
userSchema.pre("save", function (next) {
  // 'this' contains the user data
  const user = this;
  // salt = random string

  bcrypt.genSalt(10, (err, salt) => {
    // console.log(salt);
    bcrypt.hash(user.password, salt, (err, hashedPassword) => {
      user.password = hashedPassword;
      next();
    });
  });
});

module.exports = mongoose.model("User", userSchema);
