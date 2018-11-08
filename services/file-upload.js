const config = require("../config/keys");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const express = require("express");

const app = express();

aws.config.update({
  secretAccessKey: config.secretAccessKey,
  accessKeyId: config.accessKeyId,
  region: "us-east-1"
});
const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid mimetype, only JPEG and PNG"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: "blog-images54",
    acl: "public-read",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: "TESTING_META_DATA!" });
    },
    key: function(req, file, cb) {
      console.log(file);
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    }
  })
});

module.exports = upload;
