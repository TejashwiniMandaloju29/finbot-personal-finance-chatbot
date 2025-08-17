// src/ExpenseList.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/expenses");
        setExpenses(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch expenses:", err);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="p-4 bg-white shadow-lg rounded-2xl">
      <h2 className="text-xl font-bold mb-4">💰 Your Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses yet!</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((expense) => (
            <li
              key={expense._id}
              className="flex justify-between items-center border-b pb-1"
            >
              <span>{expense.description}</span>
              <span className="font-semibold text-green-600">
                ₹{expense.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseList;
