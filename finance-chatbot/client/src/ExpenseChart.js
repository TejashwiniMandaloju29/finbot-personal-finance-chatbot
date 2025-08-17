import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ExpenseChart({ data, title }) {
  // Normalize data → always map to { label, value }
  const normalized = data.map((item) => ({
    label: item.month || item.category || item._id, // month for summary, category/_id for top categories
    value: item.total || item.amount, // use whichever exists
  }));

  return (
    <div className="chart-container">
      <h3>{title}</h3>

      {normalized.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777", marginTop: "20px" }}>
          No expenses to display
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={normalized} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
