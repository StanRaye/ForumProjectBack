var express = require("express");
var router = express.Router();
const multer = require("multer");
const threadController = require("../controllers/threadController");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const sigThread = require("../models/sigThread");
const sigReply = require("../models/sigReply");
const asyncHandler = require("express-async-handler");
const url = require("url");
const { body, validationResult } = require("express-validator");
const path = require("path");

const S3 = new S3Client({
  credentials: {
    accessKeyId: "AKIARXRIFXXA6ZSP6KXU",
    secretAccessKey: REDACTED,
  },
  region: "us-east-2",
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let uniqueSuffix = "";

// Getting a json of all the threads posted to send to react
router.get("/sig/get/", threadController.getAllThreads);

// Self Improvement General POST for making a new thread
router.post("/sig/post/", threadController.postThread);

// Self Improvment General get all replies of thread
router.get("/sig/thread/", threadController.openThread);

// Self Improvment General post a reply to a thread
router.post("/sig/threadreply/", threadController.replytoThread);

router.get("sig/image/")

module.exports = router;
