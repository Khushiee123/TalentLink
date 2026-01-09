import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/login/", formData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/profile"); 
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        .login-wrapper { 
          height: 100vh; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          /* Subtle geometric background */
          background-color: #f8fafc;
          background-image: radial-gradient(#1abc9c 0.5px, transparent 0.5px);
          background-size: 24px 24px;
          font-family: 'Inter', -apple-system, sans-serif; 
        }
        .login-card { 
          background: white; 
          padding: 60px 45px; 
          border-radius: 24px; 
          width: 100%; 
          max-width: 440px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02); 
          border: 1px solid #edf2f7;
          text-align: center; 
          transition: transform 0.3s ease;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 35px;
        }
        .logo-icon {
          background: linear-gradient(135deg, #1abc9c, #16a085);
          color: white;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.3rem;
          box-shadow: 0 4px 12px rgba(26, 188, 156, 0.3);
        }
        .brand-name {
          color: #1a202c;
          font-size: 1.7rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .welcome-text { color: #718096; font-size: 1rem; margin-bottom: 30px; }
        .input-group { margin-bottom: 22px; text-align: left; }
        .input-group label { display: block; margin-bottom: 8px; color: #4a5568; font-size: 0.85rem; font-weight: 600; }
        .input-group input { 
          width: 100%; 
          padding: 14px 18px; 
          border-radius: 12px; 
          border: 1.5px solid #e2e8f0; 
          outline: none; 
          font-size: 1rem; 
          box-sizing: border-box; 
          transition: all 0.2s ease;
          background: #fdfdfd;
        }
        .input-group input:focus { 
          border-color: #1abc9c; 
          background: white;
          box-shadow: 0 0 0 4px rgba(26, 188, 156, 0.1); 
        }
        .login-btn { 
          width: 100%; 
          padding: 16px; 
          border-radius: 12px; 
          border: none; 
          background: #1abc9c; 
          color: white; 
          font-size: 1.05rem; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.3s ease; 
          margin-top: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .login-btn:hover { 
          background: #16a085; 
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(26, 188, 156, 0.2);
        }
        .login-btn:active { transform: translateY(0); }
        .login-btn:disabled { background: #a0aec0; cursor: not-allowed; }
        
        .error-msg { 
          background: #fff5f5; 
          color: #c53030; 
          padding: 14px; 
          border-radius: 12px; 
          border-left: 4px solid #fc8181;
          margin-bottom: 25px; 
          font-size: 0.9rem;
          text-align: left;
        }
        .footer-text { margin-top: 30px; font-size: 0.95rem; color: #718096; }
        .footer-text a { color: #1abc9c; font-weight: 700; text-decoration: none; }
        .footer-text a:hover { text-decoration: underline; }
      `}</style>

      <div className="login-card">
        <div className="brand-logo">
          <div className="logo-icon">TL</div>
          <h1 className="brand-name">TalentLink</h1>
        </div>
        
        <p className="welcome-text">Login to access your dashboard</p>
        
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              placeholder="e.g. johndoe" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <p className="footer-text">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}