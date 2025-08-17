// components/ExpenseView.js
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LabelList, CartesianGrid,
} from 'recharts';

export const ExpenseView = ({
  chartRef,
  selectedMonth,
  setSelectedMonth,
  monthlyChartData,
  topCategories,
  monthlySummary,
  expenses,
  exportToCSV,
  handleDownloadPDF,
  onClose
}) => {
  return (
    <div className="expense-sidebar" ref={chartRef}>
      <h3>📊 Expenses</h3>

      <label>Filter by Month:</label>
      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
        <option value="">All</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i + 1}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>

      <div className="monthly-expenses-chart">
        <h4>📅 Monthly Expenses</h4>
        {monthlyChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#82ca9d">
                <LabelList dataKey="total" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No monthly summary available.</p>
        )}
      </div>

      <div className="top-categories">
        <h4>🏆 Top Categories</h4>
        {topCategories.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8">
                <LabelList dataKey="total" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No top category data available.</p>
        )}
      </div>

      <div className="monthly-summary-list">
        <h4>📅 Monthly Summary</h4>
        {monthlySummary?.month && monthlySummary?.total !== undefined ? (
          <div className="summary-item">
            <span>Month: {monthlySummary.month}</span>
            <span>₹{monthlySummary.total.toLocaleString()}</span>
          </div>
        ) : (
          <p>No summary available.</p>
        )}
      </div>

      <ul className="expense-list">
        {expenses.map((exp, i) => (
          <li key={i}>
            ₹{exp.amount} - {exp.category} ({new Date(exp.date).toLocaleDateString()})
          </li>
        ))}
      </ul>

      <div className="export-buttons">
        <button onClick={exportToCSV}>⬇️ Export CSV</button>
        <button onClick={handleDownloadPDF}>📄 Export Charts to PDF</button>
        <button className="close-expenses" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
