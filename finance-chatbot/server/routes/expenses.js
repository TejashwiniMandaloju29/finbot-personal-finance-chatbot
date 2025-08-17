const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense.js");
// Top of file
const monthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
const protect = require("../middleware/authMiddleware");


// Route 1: Top 5 Categories
// routes/expenses.js
// GET /api/expenses/top-categories?month=7
router.get('/top-categories', async (req, res) => {
  try {
    const month = parseInt(req.query.month); // e.g., 7 for July
    const year = new Date().getFullYear();   // current year (or make it dynamic if needed)

    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid month value' });
    }

    // Calculate start and end of month
    const startDate = new Date(year, month - 1, 1); // e.g., July 1
    const endDate = new Date(year, month, 1);       // e.g., Aug 1

    // Use aggregation to group by category
    const result = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    res.json(result.map(item => ({
      category: item._id,
      total: item.total,
    })));
  } catch (error) {
    console.error('Error fetching top categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Route 2: Monthly Summary
router.get('/monthly-summary-by-month', async (req, res) => {
  try {
    const monthParam = req.query.month;
    const monthIndex = parseInt(monthParam); // 1-12
    const year = new Date().getFullYear();

    if (!monthIndex || monthIndex < 1 || monthIndex > 12) {
      return res.status(400).json({ error: "Invalid or missing month parameter" });
    }

    const startDate = new Date(year, monthIndex - 1, 1); // e.g., June => 5
    const endDate = new Date(year, monthIndex, 1);       // Next month

    const total = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json([
      {
        month: new Date(0, monthIndex - 1).toLocaleString('default', { month: 'long' }),
        total: total.length > 0 ? total[0].total : 0
      }
    ]);
  } catch (err) {
    console.error("Error in monthly-summary-by-month:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Route 3: Get expenses by month
router.get("/by-month", async (req, res) => {
  try {
    const monthName = req.query.month;
    const month = monthNameToNumber[monthName];

    if (!month) {
      return res.status(400).json({ error: "Invalid month" });
    }

    const year = new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({
      date: { $gte: start, $lt: end }
    }).sort({ date: -1 });

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses by month:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// In routes/expenses.js or similar
router.post("/add", async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;

    console.log("Received POST request to /api/expenses/add");
    console.log("Request body:", req.body);

    const newExpense = new Expense({
      amount,
      category,
      date,
      description
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Failed to add expense" });
  }
});


router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const month = req.params.month;

    const expenses = await Expense.find();
    const filtered = expenses.filter((exp) => {
      const expMonth = new Date(exp.date).toLocaleString("default", {
        month: "long",
      });
      return expMonth.toLowerCase() === month.toLowerCase();
    });

    res.json(filtered);
  } catch (error) {
    console.error("Error fetching monthly expenses:", error);
    res.status(500).json({ error: "Failed to fetch monthly expenses" });
  }
});

// Get all expenses
router.get('/all', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});



router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (message.toLowerCase().includes("spent")) {
    const amount = parseFloat(message.match(/\d+/)[0]);
    const category = message.match(/on (\w+)/i)?.[1] || "Other";
    const date = parseDateFromMessage(message); // ✅ now works

    const expense = new Expense({ amount, category, date });
    await expense.save();

    return res.json({ reply: `Got it! Added ₹${amount} for ${category}.` });
  }

  res.json({ reply: "Sorry, I didn’t understand that." });
});


// backend/routes/expenses.js or similar
router.get('/expenses/monthly-totals', async (req, res) => {
  try {
    const monthlyData = await Expense.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Convert numeric month to name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const result = monthlyData.map(entry => ({
      month: monthNames[entry._id - 1],
      total: entry.total
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching monthly totals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Clear all messages
router.delete("/messages/clear", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ success: true, message: "All messages cleared." });
  } catch (err) {
    console.error("❌ Clear Messages Error:", err.message);
    res.status(500).json({ error: "Failed to clear messages" });
  }
});


router.post("/", protect, async (req, res) => {
  try {
    const { amount, category, date } = req.body;
    const expense = new Expense({
      user: req.user._id, // link expense to logged-in user
      amount,
      category,
      date,
    });
    const savedExpense = await expense.save();
    res.json(savedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route GET /api/expenses
// @desc Get logged-in user's expenses
router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ✅ Export router (ONLY ONCE, at the END)
module.exports = router;
