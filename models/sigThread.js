const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const threadSigSchema = new Schema({
  uniqueID: { type: String },
  datePosted: { type: Date },
  authorName: { type: String, maxLength: 30 },
  title: { type: String, maxLength: 100 },
  content: { type: String, maxLength: 100000 },
  image: { type: String },
  replyRef: [{ type: String }],
  imageURL: { type: String },
});

threadSigSchema.virtual("url").get(function () {
  return `/forum/sig/${this._id}`;
});

module.exports = mongoose.model("sigThread", threadSigSchema);
