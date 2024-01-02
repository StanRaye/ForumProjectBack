const sigThread = require("../models/sigThread");
const sigReply = require("../models/sigReply");
const asyncHandler = require("express-async-handler");
const url = require("url");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const S3 = new S3Client({
  credentials: {
    accessKeyId: REDACTED,
    secretAccessKey: REDACTED,
  },
  region: "us-east-2",
  httpClient: {
    requestTimeout: 60000,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let uniqueSuffix = "";

//const storage = multer.diskStorage({
//  destination: function (req, file, cb) {
//    cb(null, "E:/Database/Images/");
//  },
//  filename: function (req, file, cb) {
//    uniqueSuffix =
//      Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
//   cb(null, uniqueSuffix);
//  },
//});

//const upload = multer({ storage: storage });

exports.getAllThreads = async function (req, res, next) {
  const threads = await sigThread.find({}).maxTimeMS(30000).exec();
  for (const thread of threads) {
    //const getObjectParams = {
    //  Bucket: "forumbucket123",
    //  Key: thread.image,
    //};
    //const command = new GetObjectCommand(getObjectParams);
    const url = `https://forumbucket123.s3.amazonaws.com/${thread.image}`;
    //await getSignedUrl(S3, command, { expiresIn: 3600 });
    thread.imageURL = url;
  }
  res.json(threads);
};

// Function for posting a new thread
exports.postThread = [
  upload.any(),
  asyncHandler(async function (req, res, next) {
    const currentUrl = req.url; // parsing last bit of url
    console.log(req.body);
    if (req.files[0]) {
      console.log(req.files[0]); // this is how to access images
      uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        req.files[0].originalname;
      const params = {
        Bucket: "forumbucket123",
        Key: uniqueSuffix,
        Body: req.files[0].buffer,
        ContentType: req.files[0].mimetype,
      };
      const command = new PutObjectCommand(params);
      await S3.send(command);
    }
    const pathname = url.parse(currentUrl).pathname;
    const lastPart = path.basename(pathname);
    // code for the SIG forum board
    const errors = validationResult(req); // checking for erros
    const thread = new sigThread({
      uniqueID: req.body.ip,
      datePosted: new Date(),
      authorName: req.body.authorName,
      content: req.body.content,
      image: uniqueSuffix,
      title: req.body.title,
    });

    uniqueSuffix = "";

    if (errors.isEmpty()) {
      // if all goes well
      await thread.save();
    } // if not all goes well
    else {
      console.log(errors);
    }
  }),
];

// Function for viewing thread replies
exports.openThread = async function (req, res, next) {
  const replies = await sigReply
    .find({ threadRef: req.query.id })
    .maxTimeMS(30000)
    .exec();
  for (const reply of replies) {
    const url = `https://forumbucket123.s3.amazonaws.com/${reply.image}`;
    reply.imageURL = url;
  }
  const threadData = {
    threadReplies: replies,
  };
  res.json(threadData);
};

// Function for Repling to a Thread/Other Reply
exports.replytoThread = [
  upload.any(),
  asyncHandler(async function (req, res, next) {
    // code for the SIG forum board
    if (req.files[0]) {
      console.log(req.files[0]); // this is how to access images
      uniqueSuffix =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        req.files[0].originalname;
      const params = {
        Bucket: "forumbucket123",
        Key: uniqueSuffix,
        Body: req.files[0].buffer,
        ContentType: req.files[0].mimetype,
      };
      const command = new PutObjectCommand(params);
      await S3.send(command);
    }
    console.log(req.body);
    const errors = validationResult(req); // checking for erros
    const listofReplies = req.body.replyingToRef.split(" ");
    for (let i = 0; i < listofReplies.length; i++) {
      if (listofReplies[i] == "") {
        listofReplies.splice(i, 1);
      }
    }
    const reply = new sigReply({
      uniqueID: req.body.ip,
      datePosted: new Date(),
      authorName: req.body.authorName,
      content: req.body.content,
      image: uniqueSuffix,
      threadRef: req.body.threadID,
      answerRef: listofReplies,
    });

    //this is to make sure the thread/reply u are replying to also is updated to reference the reply
    for (let i = 0; i < listofReplies.length; i++) {
      let objectReplyingTo = await sigThread
        .findById(listofReplies[i])
        .maxTimeMS(30000)
        .exec();
      if (objectReplyingTo != null) {
        objectReplyingTo.replyRef.push(reply._id.toString());
        console.log(objectReplyingTo);
        await objectReplyingTo.save();
      }
    }
    for (let i = 0; i < listofReplies.length; i++) {
      let objectReplyingTo = await sigReply
        .findById(listofReplies[i])
        .maxTimeMS(30000)
        .exec();
      if (objectReplyingTo != null) {
        objectReplyingTo.replyRef.push(reply._id.toString());
        console.log(objectReplyingTo);
        await objectReplyingTo.save();
      }
    }

    uniqueSuffix = "";
    if (errors.isEmpty()) {
      // if all goes well
      await reply.save();
    } // if not all goes well
    else {
      console.log(errors);
    }
  }),
];
