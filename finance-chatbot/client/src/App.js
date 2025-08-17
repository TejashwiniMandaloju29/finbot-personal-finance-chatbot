import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './App.css';
// eslint-disable-next-line
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import { Header } from './components/Header';
import { Welcome } from './components/Welcome';
import { InputBar } from './components/InputBar';
import { ExpenseView } from './components/ExpenseView';
import { ChatWindow } from './components/ChatWindow';
import { OpeningPage } from "./components/OpeningPage";
import LoginRegister from './components/LoginRegister';
import AccountSettings from "./components/AccountSettings";
import Settings from "./components/Settings";

const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
  : null;

if (recognition) {
  recognition.continuous = false;
  recognition.lang = 'en-US';
}

function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [topCategories, setTopCategories] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  // eslint-disable-next-line
  const [monthlySummary, setMonthlySummary] = useState(null);
  // eslint-disable-next-line
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('chatbotDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const chatEndRef = useRef(null);
  const chartRef = useRef(null);


  // Save theme
  useEffect(() => {
    localStorage.setItem('chatbotDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Fetch monthly totals
  useEffect(() => {
    const fetchMonthlyTotals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/expenses/monthly-totals`,{
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMonthlyTotals(data);
      } catch (err) {
        console.error("Error fetching monthly totals:", err);
      }
    };
    fetchMonthlyTotals();
  }, []);

  // Fetch expenses + categories
  
    const fetchMonthlySummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/expenses/monthly-summary-by-month?month=${selectedMonth}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Monthly summary API response:", res.data);
        const chartData = res.data.map(month => ({
          month: month.month,
          total: month.total,
        }));
        setMonthlyChartData(chartData);
      } catch (err) {
        console.error("Error fetching monthly summary:", err);
      }
    };

    const fetchTopCategories = async () => {
      try {
        if (selectedMonth) {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/expenses/top-categories?month=${selectedMonth}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Top categories API response:", res.data);
          setTopCategories(res.data);
        }
      } catch (err) {
        console.error("Error fetching top categories:", err);
      }
    };

    useEffect(() => {
      fetchMonthlySummary();
      fetchTopCategories();
      // eslint-disable-next-line
    }, [selectedMonth]);


  const fetchExpenses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/expenses?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let data = res.data;

      if (selectedMonth) {
        data = data.filter(
          (exp) => new Date(exp.date).getMonth() + 1 === parseInt(selectedMonth)
        );
      }

      const unique = new Map(data.map(exp => [
        `${exp.amount}-${exp.category}-${new Date(exp.date).toDateString()}`,
        exp
      ]));

      setExpenses([...unique.values()]);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Initialize month and messages
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    setSelectedMonth(currentMonth.toString());
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/messages`, {
          headers: { Authorization: `Bearer ${token}` }
      });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchMessages();
  }, []);

  // Scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp || Date.now()).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input, timestamp: new Date().toISOString() };
    const thinkingMessage = { sender: "bot", text: "🤖 Let me analyze that...", timestamp: new Date().toISOString() };

    const updatedMessages = [...messages, userMessage, thinkingMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const token = localStorage.getItem("token"); // ⬅ Retrieve saved token

      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } } // ⬅ Send token
      );

      const botMessage = { sender: 'bot', text: res.data.reply, timestamp: new Date().toISOString() };
      // If notifications are enabled, show one when expense is added
      if (
        localStorage.getItem("notificationsEnabled") === "true" &&
        Notification.permission === "granted"
      ) {
    
        if (/spent\s*₹?\d+/i.test(res.data.reply)) {
          new Notification("Expense Added", {
            body: res.data.reply,
            icon: "/logo192.png" 
          });
        }
      }

      const newMessages = updatedMessages.slice(0, -1).concat(botMessage);
      setMessages(newMessages);
      fetchExpenses();
      fetchMonthlySummary();
      fetchTopCategories();
    } catch (err) {
      console.error("Chat send error:", err.response?.data || err.message);
      const errorMsg = { sender: 'bot', text: 'Something went wrong. Please try again.', timestamp: new Date().toISOString() };
      setMessages(updatedMessages.slice(0, -1).concat(errorMsg));
    }

  };


  const toggleSpeech = () => {
    if (!recognition) return;
    if (!isListening) {
      recognition.start();
      setIsListening(true);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  if (recognition) {
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSend(), 300);
    };
    recognition.onend = () => setIsListening(false);
  }

  const exportToCSV = () => {
    const csvRows = [['Amount', 'Category', 'Date'],
      ...expenses.map((exp) => [exp.amount, exp.category, new Date(exp.date).toLocaleDateString()])
    ];
    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'expenses.csv';
    a.click();
  };

  const handleDownloadPDF = () => {
    if (!chartRef.current) return;
    const html2canvas = require("html2canvas");
    const { jsPDF } = require("jspdf");

    html2canvas(chartRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("charts.pdf");
    });
  };

  const handleClearChat = async () => {
    if (!window.confirm("Clear chat history?")) return;
    try {
      await axios.delete("http://localhost:5000/api/messages/clear");
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const groupedMessages = groupMessagesByDate(messages);
  const firstMessageSent = messages.length > 0;

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <Header
        onToggleExpenses={() => setShowExpenses(prev => !prev)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showExpenses={showExpenses}
      />

      <div className="main-content">
        {showExpenses ? (
          <ExpenseView
            chartRef={chartRef}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            monthlyChartData={monthlyChartData}
            topCategories={topCategories}
            monthlySummary={monthlySummary}
            expenses={expenses}
            exportToCSV={exportToCSV}
            handleDownloadPDF={handleDownloadPDF}
            onClose={() => setShowExpenses(false)}
          />
        ) : firstMessageSent ? (
          <ChatWindow groupedMessages={groupedMessages} chatEndRef={chatEndRef} />
        ) : (
          <Welcome />
        )}
      </div>

      <InputBar
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onSpeak={toggleSpeech}
        isListening={isListening}
        onClearChat={handleClearChat}
      />
    </div>
  );
}

// Main App with Routes
function App() {
  const [globalDarkMode, setGlobalDarkMode] = useState(() => {
    const saved = localStorage.getItem('globalDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('globalDarkMode', JSON.stringify(globalDarkMode));
  }, [globalDarkMode]);

  return (
    <Router>
      <div className={globalDarkMode ? "dark" : "light"}>
        <Routes>
          <Route path="/" element={<OpeningPage />} />
          <Route path="/login" element={<LoginRegister />} />
          {/* ChatbotPage has its own dark mode */}
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route
            path="/settings"
            element={<Settings darkMode={globalDarkMode} setDarkMode={setGlobalDarkMode} />}
          />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
