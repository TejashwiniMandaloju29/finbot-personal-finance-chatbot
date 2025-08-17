const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
}, { timestamps: true }); // <--- important

module.exports = mongoose.model("Message", messageSchema);
