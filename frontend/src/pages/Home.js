import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", budget: "", duration: "" });

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const profileRes = await API.get("/profile/");
      setProfile(profileRes.data);
      const projectRes = await API.get("/projects/");
      setProjects(projectRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newProject),
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setNewProject({ title: "", description: "", budget: "", duration: "" });
        fetchData();
      }
    } catch (error) { console.error(error); }
  };

  if (!profile) return <div style={styles.loading}><h2>Loading Talent Link...</h2></div>;

  const isClient = profile.role?.toLowerCase() === "client";

  return (
    <div className="app-container">
      <style>{`
        .app-container { min-height: 100vh; background: #f8fafc; font-family: 'Poppins', sans-serif; padding: 20px; }
        .content-limit { max-width: 1100px; margin: 0 auto; }
        
        /* New Global Branding Styles */
        .global-header { text-align: center; margin-bottom: 30px; padding: 20px 0; border-bottom: 1px solid #e2e8f0; }
        .brand-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -1px; }
        .brand-accent { color: #1abc9c; }
        .brand-tagline { font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; font-weight: 600; }

        .banner { background: linear-gradient(135deg, #1abc9c, #16a085); color: white; padding: 50px; border-radius: 24px; text-align: center; margin-bottom: 40px; box-shadow: 0 10px 25px rgba(26, 188, 156, 0.2); }
        .stat-card { background: #fff; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.3s ease; }
        .stat-card:hover { transform: translateY(-8px); border-color: #1abc9c; box-shadow: 0 15px 30px rgba(0,0,0,0.08); }
        .nav-back { cursor: pointer; color: #1abc9c; font-weight: 600; margin-bottom: 20px; display: inline-block; }
        .btn-action { background: #1abc9c; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.3s; }
      `}</style>

      <div className="content-limit">
        {/* --- GLOBAL HIGHLIGHTED TITLE --- */}
        <header className="global-header">
          <h1 className="brand-title">
            Talent<span className="brand-accent">Link</span>
          </h1>
          <div className="brand-tagline">— A Freelancing Platform —</div>
        </header>

        {/* Navigation Breadcrumb */}
        {activeTab !== "dashboard" && (
          <div className="nav-back" onClick={() => setActiveTab("dashboard")}>
            ← Back to Dashboard
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div>
            <div className="banner">
              <h2 style={{ fontSize: "2.2rem", marginBottom: "10px" }}>Welcome, {profile.username}!</h2>
              <p style={{ opacity: 0.9, fontSize: "1.1rem" }}>Your workspace is ready.</p>
            </div>

            <div style={styles.statsGrid}>
              <div className="stat-card" onClick={() => setActiveTab("projects")}>
                <div style={styles.statIcon}>💼</div>
                <h3 style={styles.statTitle}>Projects</h3>
                <p style={styles.statSub}>Manage listings</p>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("proposals")}>
                <div style={styles.statIcon}>📩</div>
                <h3 style={styles.statTitle}>Proposals</h3>
                <p style={styles.statSub}>Review bids</p>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("contracts")}>
                <div style={styles.statIcon}>📄</div>
                <h3 style={styles.statTitle}>Contracts</h3>
                <p style={styles.statSub}>Active agreements</p>
              </div>
              <div className="stat-card" onClick={() => setActiveTab("profile")}>
                <div style={styles.statIcon}>👤</div>
                <h3 style={styles.statTitle}>Profile</h3>
                <p style={styles.statSub}>Account settings</p>
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS VIEW */}
        {activeTab === "projects" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h2>{isClient ? "Marketplace" : "My Projects"}</h2>
              {!isClient && <button className="btn-action" onClick={() => setIsAddModalOpen(true)}>+ Post Project</button>}
            </div>
            <div style={styles.cardGrid}>
              {projects.map((p) => (
                <div key={p.id} style={styles.polishedCard}>
                  <div style={styles.userBadge}>👤 {p.freelancer_username}</div>
                  <h3 style={{ margin: "15px 0" }}>{p.title}</h3>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>{p.description}</p>
                  <div style={styles.cardFooter}>
                    <span>Budget: <strong>${p.budget}</strong></span>
                    <span><strong>{p.duration}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === "profile" && (
          <div style={{ textAlign: "center", background: "#fff", padding: "60px", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
            <img 
              src={`https://ui-avatars.com/api/?name=${profile.username}&background=1abc9c&color=fff&size=128`} 
              alt="Profile" 
              style={{ width: "120px", borderRadius: "50%", marginBottom: "20px", border: "4px solid #f0fdfa" }} 
            />
            <h2 style={{ fontSize: "2rem" }}>{profile.username}</h2>
            <p style={{ color: "#64748b" }}>{profile.email} • <strong>{profile.role}</strong></p>
            <button className="btn-action" style={{ background: "#ef4444", marginTop: "30px" }} onClick={() => { localStorage.clear(); navigate("/"); }}>Logout</button>
          </div>
        )}

        {/* PLACEHOLDERS */}
        {(activeTab === "proposals" || activeTab === "contracts") && (
          <div style={styles.placeholder}>
            <h2>{activeTab.toUpperCase()} Module</h2>
            <p>Feature coming soon.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginBottom: "20px" }}>New Project</h2>
            <form onSubmit={handleAddProject}>
              <input placeholder="Title" style={styles.input} required onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
              <textarea placeholder="Description" style={{...styles.input, height: "100px"}} required onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
              <button type="submit" className="btn-action" style={{ width: "100%" }}>Publish</button>
              <button type="button" style={{ width: "100%", background: "none", border: "none", marginTop: "10px", color: "#64748b", cursor: "pointer" }} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "25px" },
  statIcon: { fontSize: "40px", marginBottom: "15px", background: "#f0fdfa", width: "70px", height: "70px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  statTitle: { margin: "0 0 5px 0", fontSize: "1.2rem", color: "#1e293b" },
  statSub: { margin: 0, fontSize: "0.9rem", color: "#94a3b8" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" },
  polishedCard: { background: "#fff", padding: "25px", borderRadius: "20px", border: "1px solid #e2e8f0" },
  userBadge: { background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", display: "inline-block" },
  cardFooter: { display: "flex", justifyContent: "space-between", marginTop: "15px", paddingTop: "15px", borderTop: "1px dashed #e2e8f0" },
  placeholder: { textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "24px", border: "1px dashed #cbd5e1" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalContent: { background: "#fff", padding: "40px", borderRadius: "24px", width: "90%", maxWidth: "450px" },
  input: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "15px", boxSizing: "border-box" }
};