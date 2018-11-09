global.fetch = require("isomorphic-fetch");
global.navigator = {};

const express = require("express");
const router = express.Router();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const tokens = "";
const expressSanitizer = require("express-sanitizer");
const AWS = require("aws-sdk");
const cognito = require("amazon-cognito-identity-js");

const Post = require("../models/Post");
const Picture = require("../models/Picture");

const config = require("../config/keys");

// amazon bucket info

const upload = require("../services/file-upload.js");

const singleUpload = upload.single("image");

// cognito info

const poolData = {
  UserPoolId: config.amazon.UserPoolId,
  ClientId: config.amazon.ClientId
};

const userPool = new cognito.CognitoUserPool(poolData);
const divert = undefined;

router.use(cookieParser());

const getPasswordErrors = (req, source) => {
  if (source == "sign-up") {
    req.check("email", "Invalid email").isEmail();
  }
  req
    .check("password", "Password must be at least 8 characters long.")
    .isLength({ min: 8 });
  req
    .check("password", "Passwords do not match.")
    .equals(req.body["confirm-password"]);
  req
    .check("password", "Password must contain a special character.")
    .matches(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/);
  req.check("password", "Password must contain a number.").matches(/[0-9]/);
  req
    .check("password", "Password must contain a lowercase letter.")
    .matches(/[a-z]/);
  req
    .check("password", "Password must contain an uppercase letter.")
    .matches(/[A-Z]/);

  return req.validationErrors();
};

router.get("/", (req, res) => {
  Post.find({}, (err, posts) => {
    if ((currentUser = undefined)) {
      res.render("index", { posts: posts });
    } else {
      cognitoUser = userPool.getCurrentUser();
      console.log(cognitoUser);
      res.render("index", { posts: posts, cognitoUser });
    }
  });
});

router.get("/pictures", (req, res) => {
  Picture.find({}, (err, pictures) => {
    res.send({ pictures: pictures });
  });
});
router.get("/posts", (req, res) => {
  Post.find({}, (err, posts) => {
    res.send({ posts: posts });
  });
});

router.get("/dashboard", (req, res) => {
  if (!req.session.sub) {
    res.redirect("/login");
  }

  cognitoUser = userPool.getCurrentUser();

  if (userPool.getCurrentUser() == null) {
    cognitoUser = currentUser;
  } else {
    cognitoUser = userPool.getCurrentUser().username;
  }

  const allPics = Picture.find({});
  const allPosts = Post.find({});
  allPics.find({ username: String(cognitoUser) }, (err, pictures) => {
    allPosts.find({ username: String(cognitoUser) }, (err, posts) => {
      res.render("dashboard", { posts, pictures, cognitoUser });
    });
  });
});

router.get("/userpictures", (req, res) => {
  if (!req.session.sub) {
    res.redirect("/login");
  }
  const allPics = Picture.find({});
  if (userPool.getCurrentUser() == null) {
    cognitoUser = currentUser;
  } else {
    cognitoUser = userPool.getCurrentUser().username;
  }

  allPics.find({ username: String(cognitoUser) }, (err, pictures) => {
    res.send({ pictures, cognitoUser });
  });
});

router.get("/userposts", (req, res) => {
  if (!req.session.sub) {
    res.redirect("/login");
  }
  const allPosts = Post.find({});
  if (userPool.getCurrentUser() == null) {
    cognitoUser = currentUser;
  } else {
    cognitoUser = userPool.getCurrentUser().username;
  }

  allPosts.find({ username: String(cognitoUser) }, (err, posts) => {
    res.send({ posts, cognitoUser });
  });
});

router.post("/addpost", (req, res) => {
  console.log(req.body);

  new Post(req.body, req.title, req.username)
    .save()
    .then(result => {
      console.log(req.sanitize(req.body.body));
      res.redirect("/");
      console.log(result);
    })
    .catch(err => {
      res.status(400).send("Unable to save data");
    });
});

router.get("/post/:id/", (req, res, next) => {
  if (!req.session.sub) {
    res.redirect("/login");
  } else {
    cognitoUser = userPool.getCurrentUser() || currentUser;
    Post.findById(req.params.id, (err, post) => {
      let user = post.username;
      if (user != cognitoUser.username) {
        res.redirect("/");
      }
      if (err) return next(err);
      res.render("update", { post, idForHtml: req.params.id });
    });
  }
});

router.use((req, res, next) => {
  if (req.query._method == "DELETE") {
    req.method = "DELETE";
    req.url = req.path;
  }
  next();
});

router.delete("/post/delete/:id", (req, res, next) => {
  if (!req.session.sub) {
    res.redirect("/login");
  } else {
    Post.findByIdAndRemove(req.params.id, (err, post) => {
      if (err) return next(err);
      res.redirect("/dashboard");
    });
  }
});

router.put("/post/update/:id", (req, res, next) => {
  Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        body: req.body.body,
        title: req.body.title
      }
    },
    (err, post) => {
      if (err) return next(err);
      res.redirect("/");
    }
  );
});

// AWS Cognito

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;

  if (password !== confirmPassword) {
    return res.redirect("signup?error=passwords");
  }

  const emailData = {
    Name: "email",
    Value: email
  };

  const emailAttribute = new cognito.CognitoUserAttribute(emailData);

  userPool.signUp(email, password, [emailAttribute], null, (err, data) => {
    if (err) {
      return console.error(err);
    }
    res.send("Success!");
  });
});

router.post("/login", (req, res) => {
  if (req.session.sub) {
    res.redirect("/dashboard");
  }
  const loginDetails = {
    Username: req.body.email,
    Password: req.body.password
  };
  const authenticationDetails = new cognito.AuthenticationDetails(loginDetails);

  const userDetails = {
    Username: req.body.email,
    Pool: userPool
  };

  const cognitoUser = new cognito.CognitoUser(userDetails);

  req.session["log-in-errors"] = [];

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(data) {
      console.log(data);
      const tokens = {
        accessToken: data.getAccessToken().getJwtToken(),
        idToken: data.getIdToken().getJwtToken(),
        refreshToken: data.getRefreshToken().getToken()
      };
      cognitoUser["tokens"] = tokens;
      Promise.resolve(cognitoUser);
      console.log(data);
      console.log(tokens);
      accessToken = data.getAccessToken().getJwtToken();
      req.session.sub = data.idToken.payload.sub;
      currentUser = data.idToken.payload.email;

      return res.redirect("/dashboard");
    },
    onFailure: function(err) {
      Promise.resolve(cognitoUser);

      console.log(new Error().stack);
      console.log(err.message || JSON.stringify(err));
      req.session["log-in-errors"].push(err.message);

      return res.redirect("/login");
    },
    newPasswordRequired: function(userAttributes) {
      delete userAttributes.email_verified;
      cognitoUser.completeNewPasswordChallenge(
        newPassword,
        userAttributes,
        this
      );
    }
  });
});

router.get("/login", (req, res) => {
  res.render("login", { errors: req.session["log-in-errors"] });
  req.session["log-in-errors"] = [];
});

router.get("/signout", (req, res) => {
  cognitoUser = userPool.getCurrentUser();
  cognitoUser.getSession((e, s) => console.log(e || "session acquired"));

  if (cognitoUser != null) {
    cognitoUser.globalSignOut({
      onFailure: e => console.log(e),
      onSuccess: r => {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/image-upload", (req, res) => {
  singleUpload(req, res, function(err) {
    if (err) {
      res.status(422).send({
        errors: [{ title: "File upload error", detail: err.message }]
      });
    }
    cognitoUser = userPool.getCurrentUser();

    const pictureInfo = {
      title: req.body.title,
      username: req.body.username,
      url: req.file.location
    };
    new Picture(pictureInfo)
      .save()
      .then(result => {})
      .catch(err => {
        res.status(400).send("Unable to save data");
      });

    return res.json({
      imageUrl: req.file.location
    });
  });
});

module.exports = router;
