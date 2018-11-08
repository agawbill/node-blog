global.fetch = require("isomorphic-fetch");
global.navigator = {};
var fetch = require("node-fetch");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const expressValidator = require("express-validator");
const expressSanitizer = require("express-sanitizer");
const express = require("express");
var methodOverride = require("method-override");
const app = express();

const mongoose = require("mongoose");

const session = {
  secret: "change this",
  resave: false,
  saveUnitialized: true
};

const keys = require("./config/keys");
mongoose.connect(`${keys.mongoURI}`);
const routes = require("./routes/routes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use(expressSession(session));
app.use("/", routes);
app.use(express.static(__dirname + "/public"));

// listen

app.listen(8081, () => {
  console.log("hello port 8081");
});
