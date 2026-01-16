import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [data, setData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    role: "client",
    skills: "",
    portfolio: "",
    hourly_rate: 0,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/register/", data);
      if (res.status === 201 || res.status === 200) {
        alert("Registration Successful!");
        navigate("/");
      }
    } catch (err) {
      console.error("Register Error:", err.response?.data);
      const msg = err.response?.data?.username ? "Username already exists!" : "Something went wrong. Please try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-wrapper">
      <style>{`
        .reg-wrapper { 
          min-height: 100vh; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          background-color: #f8fafc;
          background-image: radial-gradient(#1abc9c 0.5px, transparent 0.5px);
          background-size: 24px 24px;
          font-family: 'Inter', -apple-system, sans-serif; 
          padding: 40px 20px;
        }
        .reg-card { 
          background: white; 
          padding: 50px; 
          border-radius: 24px; 
          width: 100%; 
          max-width: 500px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.04); 
          border: 1px solid #edf2f7;
          text-align: center; 
        }
        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 25px;
        }
        .logo-icon {
          background: linear-gradient(135deg, #1abc9c, #16a085);
          color: white;
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 1.1rem;
        }
        .brand-name {
          color: #1a202c;
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }
        h2 { color: #718096; font-size: 1rem; margin-bottom: 30px; font-weight: 400; }
        
        .input-row { display: flex; gap: 15px; text-align: left; }
        .input-group { flex: 1; margin-bottom: 18px; text-align: left; }
        
        .input-group label { display: block; margin-bottom: 8px; color: #4a5568; font-size: 0.85rem; font-weight: 600; }
        .input-group input, .input-group select { 
          width: 100%; 
          padding: 12px 16px; 
          border-radius: 12px; 
          border: 1.5px solid #e2e8f0; 
          outline: none; 
          font-size: 0.95rem; 
          box-sizing: border-box; 
          transition: all 0.2s ease;
          background: #fdfdfd;
        }
        .input-group input:focus, .input-group select:focus { 
          border-color: #1abc9c; 
          box-shadow: 0 0 0 4px rgba(26, 188, 156, 0.1); 
        }
        
        .reg-btn { 
          width: 100%; 
          padding: 16px; 
          border-radius: 12px; 
          border: none; 
          background: #1abc9c; 
          color: white; 
          font-size: 1rem; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.3s ease; 
          margin-top: 10px;
        }
        .reg-btn:hover { 
          background: #16a085; 
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(26, 188, 156, 0.2);
        }
        .reg-btn:disabled { background: #a0aec0; }

        .footer-text { margin-top: 25px; font-size: 0.95rem; color: #718096; }
        .footer-text a { color: #1abc9c; font-weight: 700; text-decoration: none; }
      `}</style>

      <div className="reg-card">
        <div className="brand-logo">
          <div className="logo-icon">TL</div>
          <h1 className="brand-name">TalentLink</h1>
        </div>
        
        <h2>Join our community of professionals</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input 
              placeholder="Pick a unique username" 
              onChange={(e) => setData({ ...data, username: e.target.value })} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              onChange={(e) => setData({ ...data, email: e.target.value })} 
              required 
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setData({ ...data, password: e.target.value })} 
                required 
              />
            </div>
            <div className="input-group">
              <label>I am a...</label>
              <select value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })}>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
          </div>

          <button type="submit" className="reg-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        
        <p className="footer-text">
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
}