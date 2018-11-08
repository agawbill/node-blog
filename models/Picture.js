const mongoose = require("mongoose");
var pictureSchema = new mongoose.Schema({
  title: String,
  username: String,
  url: String
});
var Picture = mongoose.model("Picture", pictureSchema);

module.exports = Picture;
