const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  resetCode: String,
  resetCodeExpiry: Date,
});

module.exports = mongoose.model("User", userSchema);
