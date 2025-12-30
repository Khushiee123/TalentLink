import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/login/", formData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/profile"); // This is your dashboard tab
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container { height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #1abc9c; font-family: 'Segoe UI', sans-serif; }
        .login-card { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); text-align: center; color: white; }
        .input-group { margin-bottom: 20px; }
        .input-group input { width: 100%; padding: 12px 15px; border-radius: 10px; border: none; outline: none; font-size: 1rem; box-sizing: border-box; }
        .login-btn { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #16a085; color: white; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .login-btn:hover { background: #148f77; }
        .error-msg { background: #e74c3c; color: white; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; }
        .footer-text { margin-top: 20px; font-size: 0.9rem; }
        .footer-text a { color: white; font-weight: bold; text-decoration: none; }
      `}</style>

      <div className="login-card">
        <h1>Talent link</h1>
        <h2>Login</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="footer-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}