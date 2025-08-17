const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const Expense = require("./models/Expense.js");
const Message = require("./models/Message.js");
const expensesRoutes = require("./routes/expenses.js");
const chrono = require('chrono-node');
const authRoutes = require("./routes/authRoutes.js");
const messageRoutes = require("./routes/messageRoutes");
const protect = require("./middleware/authMiddleware"); // ✅ Added auth middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

function parseDateFromMessage(message) {
  const parsedDate = chrono.parseDate(message);
  return parsedDate || new Date();
}

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/expenses", protect, expensesRoutes); // ✅ Protect expense routes
app.use('/api/messages', require('./routes/messageRoutes'));
  // ✅ Protect message routes

function detectCategory(description) {
  const desc = description.toLowerCase();
  if (desc.includes("uber") || desc.includes("bus") || desc.includes("train") || desc.includes("flight")) return "Travel";
  if (desc.includes("pizza") || desc.includes("burger") || desc.includes("restaurant") || desc.includes("cafe")) return "Food";
  if (desc.includes("shoes") || desc.includes("jeans") || desc.includes("clothes") || desc.includes("t-shirt")) return "Shopping";
  if (desc.includes("movie") || desc.includes("netflix") || desc.includes("spotify")) return "Entertainment";
  if (desc.includes("electricity") || desc.includes("water") || desc.includes("internet") || desc.includes("rent")) return "Utilities";
  if (desc.includes("doctor") || desc.includes("medicine") || desc.includes("hospital")) return "Health";
  return "Others";
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- CHATBOT ROUTE (Protected) ---
app.post("/api/chat", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userMessage = req.body.message?.toLowerCase() || "";
    console.log("🟢 /api/chat — user:", userId, userMessage);

    // Greeting
    if (/(hi|hello|hey|hola|hii|hlo|hai)/i.test(userMessage)) {
      const reply = "👋 Hi there! Want to check your expenses or add a new one?";
      await Message.create([
        { user: userId, sender: "user", text: userMessage, timestamp: new Date() },
        { user: userId, sender: "bot", text: reply, timestamp: new Date(Date.now() + 1) }
      ]);
      return res.json({ reply });
    }

    // Expense parse (same pattern you had)
    const expensePattern = /(?:spent|paid|used)\s*₹?\s*\$?(\d+)\s*(?:on)?\s*(.+)/i;
    const match = userMessage.match(expensePattern);
    if (match) {
      const amount = parseFloat(match[1]);
      const description = match[2].trim();
      const category = detectCategory(description);
      const date = parseDateFromMessage(userMessage);

      const newExpense = new Expense({ user: userId, amount, category, date, description });
      await newExpense.save();

      const reply = `✅ Noted! You spent ₹${amount} on ${description}.`;
      await Message.create([{ user: userId, sender: "user", text: userMessage }, { user: userId, sender: "bot", text: reply }]);
      return res.json({ reply });
    }

    // other intent handling...
    // fallback to Together.ai (save messages afterward)
    const response = await axios.post("https://api.together.xyz/v1/chat/completions",   // ✅ Correct URL
      {
        model: "meta-llama/Llama-3-8b-chat-hf",      // ✅ Pick your model
        messages: [
          { role: "system", content: "You are FinBot, a helpful finance assistant. Keep answers short (2–3 sentences max)." },
          { role: "user", content: userMessage }],
          max_tokens: 150,   // ✅ limit response length
          temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const reply = response.data.choices[0].message.content;
    await Message.create([{ user: userId, sender: "user", text: userMessage, timestamp: new Date() }, { user: userId, sender: "bot", text: reply, timestamp: new Date(Date.now() + 1) }]);
    return res.json({ reply });

  } catch (err) {
    console.error("❌ /api/chat error:", err?.response?.data || err.message || err);
    return res.status(500).json({ reply: "Couldn't analyze that right now." });
  }
});



// --- Get Messages for Logged-in User ---
app.get("/api/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// --- Monthly Expense Summary ---
app.get("/api/expenses/monthly-summary", protect, async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } },
      { $sort: { "_id": 1 } },
    ]);
    const formatted = summary.map((item) => ({
      month: new Date(2000, item._id - 1).toLocaleString('default', { month: 'short' }),
      total: item.total,
    }));
    res.json(formatted);
  } catch {
    res.status(500).json({ error: "Failed to fetch monthly summary" });
  }
});

// --- Top Categories by Month ---
app.get("/api/expenses/top-categories", protect, async (req, res) => {
  try {
    const month = req.query.month;
    let matchQuery = { user: req.user._id };
    if (month) {
      const year = new Date().getFullYear();
      const monthInt = parseInt(month) - 1;
      const start = new Date(year, monthInt, 1);
      const end = new Date(year, monthInt + 1, 1);
      matchQuery.date = { $gte: start, $lt: end };
    }
    const topCategories = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);
    res.json(topCategories);
  } catch {
    res.status(500).json({ error: "Failed to fetch top categories" });
  }
});


// --- Add Expense API ---

app.post("/api/expenses", protect, async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const { description, amount, date } = req.body;
    const category = detectCategory(description);
    console.log("Detected Category:", category);

    const newExpense = new Expense({
      description,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      user: req.user._id // ✅ Link expense to logged-in user
    });

    await newExpense.save();
    res.status(200).json({ message: "✅ Expense saved!" });
  } catch (error) {
    console.error("❌ Manual Save Error:", error);
    res.status(500).json({ error: "Could not save expense." });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
