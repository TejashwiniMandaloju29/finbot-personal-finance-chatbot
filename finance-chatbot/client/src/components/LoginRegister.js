import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginRegister.css"; 


export default function LoginRegister() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isRegister
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    const payload = isRegister
      ? {
          name: e.target.name?.value,
          email: e.target.email.value,
          password: e.target.password.value,
        }
      : {
          email: e.target.email.value,
          password: e.target.password.value,
        };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/chat");
      } else {
        alert(data.msg || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login/Register error:", err);
      alert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p className="subtitle">
          {isRegister
            ? "Join us today! It takes only a few steps"
            : "Login to access your account"}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <input type="text" name="name" placeholder="Full Name" required />
            </div>
          )}
          <div className="form-group">
            <input type="email" name="email" placeholder="Email Address" required />
          </div>
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="btn-link"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
}
