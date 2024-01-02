const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
  uniqueID: { type: String },
  datePosted: { type: Date },
  authorName: { type: String, maxLength: 30 },
  content: { type: String, maxLength: 4000 },
  image: { type: String },
  imageURL: { type: String },
  threadRef: { type: Schema.Types.ObjectId, ref: "sigThread" },
  answerRef: [{ type: String }],
  replyRef: [{ type: String }],
});

module.exports = mongoose.model("sigReply", replySchema);
