const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const Message = require("../models/Message");

// GET user messages
router.get("/", protect, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// POST new message
router.post("/", async (req, res) => {
  try {
    const { message } = req.body; // <-- match frontend
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userMessage = new Message({
      user: req.user._id,
      sender: "user",
      text: message,
    });
    await userMessage.save();

    let botReply;
    if (/^\s*(hi|hello|hey|howdy)\b/i.test(message)) {
      botReply = "Hello! I'm your finance assistant — how can I help with expenses today?";
    } else {
      // Call AI API here
    }

    const botMessage = new Message({
      user: req.user._id,
      sender: "bot",
      text: botReply,
    });
    await botMessage.save();

    res.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE all messages for this user
router.delete("/clear", protect, async (req, res) => {
  try {
    await Message.deleteMany({ user: req.user._id });
    res.json({ msg: "Chat history cleared" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
