import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState("client");

  // Define the steps for each flow
  const flows = {
    client: [
      { step: "01", icon: "📝", title: "Post a Project", desc: "List your requirements and set a budget in minutes." },
      { step: "02", icon: "🔍", title: "Review Bids", desc: "Browse tailored proposals from top-rated professionals." },
      { step: "03", icon: "💬", title: "Collaborate", desc: "Chat in real-time and manage milestones securely." },
      { step: "04", icon: "💳", title: "Easy Payment", desc: "Pay safely via our escrow-style contract system." }
    ],
    freelancer: [
      { step: "01", icon: "👤", title: "Build Profile", desc: "Create a stunning portfolio that attracts top clients." },
      { step: "02", icon: "🚀", title: "Apply & Bid", desc: "Find projects that match your stack and submit bids." },
      { step: "03", icon: "🤝", title: "Get Hired", desc: "Sign smart contracts and start working immediately." },
      { step: "04", icon: "💰", title: "Withdraw", desc: "Get paid on time, every time, directly to your account." }
    ]
  };

  return (
    <div className="talentlink-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

        .talentlink-landing {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a202c;
          background: #ffffff;
          line-height: 1.6;
        }

        /* Navbar */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 8%;
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          z-index: 1000;
          border-bottom: 1px solid #f0f0f0;
        }
        .logo-container { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .logo-box { background: #1abc9c; color: white; padding: 6px 10px; border-radius: 8px; font-weight: 800; }
        .logo-text { font-size: 1.5rem; font-weight: 800; color: #1a202c; margin: 0; }
        .nav-btns { display: flex; gap: 15px; flex-wrap: wrap; }
        .btn-secondary { background: none; border: none; color: #4a5568; font-weight: 600; cursor: pointer; padding: 10px 20px; }
        .btn-primary { background: #1abc9c; color: white; border: none; padding: 10px 25px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .btn-primary:hover { background: #16a085; transform: translateY(-2px); }
        .btn-secondary:hover {
           color: #1abc9c;
           text-decoration: underline;}

        /* Specific fix for the dark freelancer button */
          .role-card .btn-primary[style*="background: rgb(26, 32, 44)"]:hover {
           background: #2d3748 !important;}

        /* Hero Section */
        .hero {
          display: flex;
          align-items: center;
          padding: 80px 8%;
          gap: 50px;
          background: radial-gradient(circle at top right, #e6fffa, #ffffff);
        }
        .hero-text { flex: 1; }
        .badge { background: #e6fffa; color: #16a085; padding: 6px 16px; border-radius: 100px; font-size: 0.85rem; font-weight: 700; margin-bottom: 20px; display: inline-block; }
        
        /* Responsive Title */
        .hero-text h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); line-height: 1.1; margin-bottom: 25px; font-weight: 800; letter-spacing: -1px; }
        .hero-text p { font-size: clamp(1rem, 2vw, 1.25rem); color: #4a5568; margin-bottom: 35px; max-width: 500px; }
        
        .hero-visual { flex: 1; display: flex; justify-content: center; }
        .mockup-container { width: 100%; max-width: 500px; height: 350px; background: #e2e8f0; border-radius: 30px; position: relative; overflow: hidden; }

        /* Dual Role Section */
        .roles-section { padding: 80px 8%; background: #f8fafc; }
        .section-title { text-align: center; margin-bottom: 60px; }
        .section-title h2 { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; }
        
        /* Grid handles columns automatically */
        .roles-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        
        .role-card { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; transition: 0.3s; display: flex; flex-direction: column; }
        .role-card:hover { border-color: #1abc9c; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .role-icon { font-size: 2rem; margin-bottom: 20px; }
        .role-card h3 { font-size: 1.8rem; margin-bottom: 20px; color: #1a202c; }
        .role-list { list-style: none; padding: 0; margin-bottom: 30px; flex-grow: 1; }
        .role-list li { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; color: #4a5568; font-size: 0.95rem; }
        .check { color: #1abc9c; font-weight: bold; }

        /* Stats Section */
        .stats { display: flex; flex-wrap: wrap; justify-content: space-around; padding: 60px 8%; text-align: center; gap: 30px; }
        .stat-item h4 { font-size: 2.5rem; color: #1abc9c; margin-bottom: 5px; }
        .stat-item p { color: #718096; font-weight: 600; }

        /* Flow CSS */
        .flow-section { 
          padding: 100px 8%; 
          background: #ffffff; 
          text-align: center;
          overflow: hidden;
        }

        .flow-toggle-container {
          margin-bottom: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .flow-toggle { 
          display: inline-flex; 
          background: #f1f5f9; 
          padding: 8px; 
          border-radius: 100px; 
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }

        .toggle-btn { 
          padding: 14px 35px; 
          border-radius: 100px; 
          border: none; 
          cursor: pointer; 
          font-weight: 700; 
          font-size: 1rem;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: transparent;
          color: #64748b;
        }

        .toggle-btn.active { 
          background: #1abc9c; 
          color: white; 
          box-shadow: 0 10px 20px rgba(26, 188, 156, 0.3);
          transform: scale(1.05);
        }

        .flow-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 25px; 
          perspective: 1000px;
        }

        .flow-step { 
          padding: 40px 30px; 
          background: #ffffff; 
          border-radius: 28px; 
          border: 1px solid #f1f5f9;
          position: relative; 
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          animation: cardAppear 0.6s backwards;
        }

        /* Staggered Animation for steps */
        .flow-step:nth-child(1) { animation-delay: 0.1s; }
        .flow-step:nth-child(2) { animation-delay: 0.2s; }
        .flow-step:nth-child(3) { animation-delay: 0.3s; }
        .flow-step:nth-child(4) { animation-delay: 0.4s; }

        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(30px) rotateX(-10deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0); }
        }

        .flow-step:hover { 
          transform: translateY(-10px); 
          border-color: #1abc9c;
          box-shadow: 0 20px 40px rgba(26, 188, 156, 0.1); 
        }

        .step-icon {
          font-size: 2.5rem;
          margin-bottom: 20px;
          display: inline-block;
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
        }

        .step-num { 
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 2.5rem;
          font-weight: 900;
          color: #f1f5f9;
          z-index: 0;
          user-select: none;
        }

        .flow-step h4 { 
          font-size: 1.3rem; 
          margin-bottom: 12px; 
          color: #1a202c; 
          position: relative; 
          z-index: 1;
        }

        .flow-step p { 
          font-size: 0.95rem; 
          color: #718096; 
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        /* Connecting line for desktop */
        @media (min-width: 1024px) {
          .flow-grid::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 10%;
            right: 10%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            z-index: 0;
          }
        }

        @media (max-width: 768px) {
          .flow-grid { grid-template-columns: 1fr; }
        }

        /* CTA Footer */
        .footer-cta { background: #1a202c; color: white; padding: 80px 8%; text-align: center; border-radius: 0; }
        .footer-cta h2 { font-size: clamp(1.8rem, 4vw, 2.8rem); margin-bottom: 20px; }
        .footer-cta p { opacity: 0.8; margin-bottom: 40px; }

        /* MOBILE RESPONSIVE QUERIES */
        @media (max-width: 992px) {
          .hero { flex-direction: column; text-align: center; padding: 60px 5%; }
          .hero-text p { margin-left: auto; margin-right: auto; }
          .hero-text .nav-btns { justify-content: center; }
          .mockup-container { height: 280px; }
        }

        @media (max-width: 600px) {
          .navbar { padding: 15px 5%; }
          .logo-text { font-size: 1.2rem; }
          .nav-btns { gap: 5px; }
          .btn-secondary, .btn-primary { padding: 8px 15px; font-size: 0.9rem; }
          .roles-container { grid-template-columns: 1fr; }
          .role-card { padding: 30px 20px; }
          .footer-cta { padding: 60px 5%; }
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo-container" onClick={() => navigate("/")}>
          <div className="logo-box">TL</div>
          <h1 className="logo-text">TalentLink</h1>
        </div>
        <div className="nav-btns">
          <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-primary" onClick={() => navigate("/login")}>Join Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          
          <h1>Work with the best talent, anywhere.</h1>
          <p>The ultimate marketplace for clients to post projects and freelancers to build their dreams. Simple. Secure. Fast.</p>
          <div className="nav-btns">
            <button className="btn-primary" style={{padding: '18px 40px'}} onClick={() => navigate("/login")}>Post a Project</button>
            <button className="btn-secondary" style={{textDecoration: 'underline'}} onClick={() => navigate("/login")}>Find Work</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mockup-container">
            <div style={{position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
    {/* Profile Header Mockup */}
    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
        <div style={{width: '35px', height: '35px', background: '#e2e8f0', borderRadius: '50%'}}></div>
        <div style={{width: '40%', height: '10px', background: '#f0f0f0', borderRadius: '4px'}}></div>
    </div>
    <div style={{width: '90%', height: '15px', background: '#1abc9c', borderRadius: '4px', marginBottom: '20px'}}></div>
    <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
       <div style={{flex: 1, height: '80px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7'}}></div>
       <div style={{flex: 1, height: '80px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7'}}></div>
    </div>
    {/* Added more content lines for "fullness" */}
    <div style={{width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px'}}></div>
    <div style={{width: '70%', height: '8px', background: '#f0f0f0', borderRadius: '4px'}}></div>
</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats">
        <div className="stat-item"><h4>$0</h4><p>Fees for starters</p></div>
        <div className="stat-item"><h4>24/7</h4><p>Secure Messaging</p></div>
        <div className="stat-item"><h4>100%</h4><p>Verified Profiles</p></div>
      </div>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="section-title">
          <h2>One Platform, Two Ways to Grow</h2>
        </div>
        <div className="roles-container">
          
          <div className="role-card">
            <div className="role-icon">💼</div>
            <h3>For Clients</h3>
            <ul className="role-list">
              <li><span className="check">✓</span> Post unlimited projects</li>
              <li><span className="check">✓</span> Review vetted proposals</li>
              <li><span className="check">✓</span> Create secure contracts</li>
              <li><span className="check">✓</span> Live chat & direct messaging</li>
              <li><span className="check">✓</span> Rate your freelancer</li>
            </ul>
            <button className="btn-primary" style={{width: '100%'}} onClick={() => navigate("/login")}>Hire Talent</button>
          </div>

          <div className="role-card">
            <div className="role-icon">🚀</div>
            <h3>For Freelancers</h3>
            <ul className="role-list">
              <li><span className="check">✓</span> Create a professional portfolio</li>
              <li><span className="check">✓</span> Apply to global projects</li>
              <li><span className="check">✓</span> Negotiate terms via proposals</li>
              <li><span className="check">✓</span> Build a verified rating</li>
              <li><span className="check">✓</span> Secure payments & contracts</li>
            </ul>
            <button className="btn-primary" style={{width: '100%', background: '#1a202c'}} onClick={() => navigate("/login")}>Find Work</button>
          </div>

        </div>
      </section>
      {/*Flow Section */}
      <section className="flow-section">
        <div className="flow-toggle-container">
          <span className="badge">Platform Workflow</span>
          <h2>How TalentLink Works</h2>
          <div className="flow-toggle">
            <button 
              className={`toggle-btn ${activeFlow === 'client' ? 'active' : ''}`}
              onClick={() => setActiveFlow('client')}
            >
              Hire Talent
            </button>
            <button 
              className={`toggle-btn ${activeFlow === 'freelancer' ? 'active' : ''}`}
              onClick={() => setActiveFlow('freelancer')}
            >
              Find Work
            </button>
          </div>
        </div>

        {/* Key for activeFlow forces React to re-mount the grid, triggering animations */}
        <div className="flow-grid" key={activeFlow}>
          {flows[activeFlow].map((item, index) => (
            <div key={index} className="flow-step">
              <span className="step-num">{item.step}</span>
              <div className="step-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="footer-cta">
        <h2>Start your journey with TalentLink</h2>
        <p>Join thousands of users who are already scaling their businesses and careers.</p>
        <button className="btn-primary" style={{padding: '18px 50px', fontSize: '1.1rem'}} onClick={() => navigate("/login")}>Create Free Account</button>
        <div style={{marginTop: '40px', fontSize: '0.9rem', opacity: '0.5'}}>
          &copy; 2026 TalentLink Freelance Marketplace
        </div>
      </section>
    </div>
  );
}