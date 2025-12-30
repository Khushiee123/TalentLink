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
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/register/", data);
      if (res.status === 201 || res.status === 200) {
        alert("Registration Successful!");
        navigate("/");
      }
    } catch (err) {
      console.error("Register Error:", err.response?.data);
      const msg = err.response?.data?.username ? "Username exists!" : "Check fields and try again.";
      alert(msg);
    }
  };

  return (
    <div className="reg-container">
      <style>{`
        .reg-container { height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #1abc9c; font-family: 'Segoe UI', sans-serif; }
        form { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); padding: 40px; border-radius: 20px; width: 350px; text-align: center; color: white; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        input, select { display: block; width: 100%; margin: 15px 0; padding: 12px; border-radius: 10px; border: none; outline: none; box-sizing: border-box; }
        button { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #16a085; color: white; font-weight: bold; cursor: pointer; margin-top: 10px; }
        button:hover { background: #148f77; }
      `}</style>

      <form onSubmit={handleSubmit}>
        <h1>Talent link</h1>
        <h2>Create Account</h2>
        <input placeholder="Username" onChange={(e) => setData({ ...data, username: e.target.value })} required />
        <input type="email" placeholder="Email" onChange={(e) => setData({ ...data, email: e.target.value })} required />
        <input type="password" placeholder="Password" onChange={(e) => setData({ ...data, password: e.target.value })} required />
        <select value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>
        <button type="submit">Register</button>
        <p style={{marginTop:'20px', fontSize:'0.9rem'}}>
          Already have an account? <Link to="/" style={{color:'white', fontWeight:'bold', textDecoration:'none'}}>Login</Link>
        </p>
      </form>
    </div>
  );
}