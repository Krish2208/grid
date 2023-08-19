const mongoose = require("mongoose");

const voteSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  favor: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  against: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
});

const Vote = mongoose.model("Vote", voteSchema);
module.exports = Vote;