const mongoose = require("mongoose");
var postSchema = new mongoose.Schema({
  title: String,
  username: String,
  body: String
});
var Post = mongoose.model("Post", postSchema);

module.exports = Post;
