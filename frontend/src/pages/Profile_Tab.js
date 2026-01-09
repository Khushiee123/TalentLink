import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function ProfileTab({ profile, contracts, proposals, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Identify role for conditional logic
  const isFreelancer = profile?.role?.toLowerCase() === "freelancer";

  // Initialize state with safety wrappers
  const [formData, setFormData] = useState({
    bio: String(profile?.bio || ""),
    skills: String(profile?.skills || ""),
    location: String(profile?.location || ""),
    hourly_rate: String(profile?.hourly_rate || "0"),
    availability: profile?.availability ?? true, // Boolean handling for Django checkbox
  });

  

  // Keep state in sync if profile props update
  useEffect(() => {
    setFormData({
      bio: String(profile?.bio || ""),
      skills: String(profile?.skills || ""),
      location: String(profile?.location || ""),
      hourly_rate: String(profile?.hourly_rate || "0"),
      availability: profile?.availability ?? true,
    });
  }, [profile]);

  // --- PRODUCTION CALCULATIONS ---
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const safeProposals = Array.isArray(proposals) ? proposals : [];
  
  const completedCount = safeContracts.filter(c => c.status?.toLowerCase() === 'completed').length;
  const totalContracts = safeContracts.length;
  const completionRate = totalContracts > 0 ? Math.round((completedCount / totalContracts) * 100) : 0;
  const winRate = safeProposals.length > 0 ? Math.round((totalContracts / safeProposals.length) * 100) : 0;


  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const response = await API.patch("/profile/", formData);
    if (response.status === 200) {
      // This calls the 'fetchData' function in Home.js
      onRefresh(); 
      setIsModalOpen(false);
    }
  } catch (err) {
    console.error("Update failed", err);
  }
};

  return (
    <div className="profile-dashboard fade-in">
      <style>{modernDashboardStyles}</style>

      {/* --- HEADER SECTION (Role Aware) --- */}
      <div className="profile-header-card">
        <div className="header-flex">
          <div className="avatar-shield">
            <div className="avatar-box">
              {profile.username?.substring(0, 2).toUpperCase()}
            </div>
            {isFreelancer && (
              <div className={`status-dot ${formData.availability ? 'online' : 'away'}`}></div>
            )}
          </div>
          
          <div className="header-info">
            <div className="name-badge-row">
              <h1>{profile.username}</h1>
              <span className="role-chip">{profile.role || "User"}</span>
            </div>
            <p className="location-tag">📍 {formData.location || "Remote"}</p>
            
            <div className="meta-stats">
              {isFreelancer ? (
                <>
                  <span className="meta-pill">💰 ${formData.hourly_rate}/hr</span>
                  <span className="meta-pill">🚀 {formData.availability ? "Available Now" : "Currently Busy"}</span>
                </>
              ) : (
                <span className="meta-pill">💼 Verified Client</span>
              )}
            </div>
          </div>

          <button className="btn-edit-profile" onClick={() => setIsModalOpen(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="dashboard-grid">
        {/* Left Column: Stats */}
        <div className="grid-column">
          <div className="bento-card">
            <h3>{isFreelancer ? "Performance Metrics" : "Hiring Activity"}</h3>
            {isFreelancer ? (
              <div className="metrics-flex">
                <div className="progress-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart green">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${completionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" className="percentage">{completionRate}%</text>
                  </svg>
                  <span>Completion</span>
                </div>
                <div className="progress-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart blue">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${winRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" className="percentage">{winRate}%</text>
                  </svg>
                  <span>Win Rate</span>
                </div>
              </div>
            ) : (
              <div className="client-stats-display">
                <div className="big-stat">
                  <strong>{safeContracts.length}</strong>
                  <label>Active Jobs</label>
                </div>
                <div className="big-stat">
                  <strong>{safeProposals.length}</strong>
                  <label>Proposals Received</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bio & Skills */}
        <div className="grid-column">
          <div className="bento-card">
            <h3>{isFreelancer ? "About Me" : "Company Bio"}</h3>
            <p className="bio-text">{formData.bio || "No description provided yet."}</p>
          </div>

          {isFreelancer && (
            <div className="bento-card">
              <h3>Technical Stack</h3>
              <div className="skills-wrap">
                {formData.skills ? formData.skills.split(",").map((s, i) => (
                  <span key={i} className="skill-tag">{s.trim()}</span>
                )) : <span className="empty-msg">No skills listed</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT MODAL (Conditional Fields) --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Profile</h2>
            <form onSubmit={handleUpdate} className="edit-form">
              <label>Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />

              <label>{isFreelancer ? "Professional Bio" : "Business Description"}</label>
              <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />

              {isFreelancer && (
                <>
                  <div className="form-row">
                    <div className="field">
                      <label>Hourly Rate ($)</label>
                      <input type="number" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: e.target.value})} />
                    </div>
                    <div className="field">
                      <label>Availability</label>
                      <div className="toggle-box" onClick={() => setFormData({...formData, availability: !formData.availability})}>
                        <div className={`toggle-switch ${formData.availability ? 'on' : 'off'}`}></div>
                        <span>{formData.availability ? "Available" : "Busy"}</span>
                      </div>
                    </div>
                  </div>
                  <label>Skills (comma separated)</label>
                  <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const modernDashboardStyles = `
  .profile-dashboard { padding: 20px; max-width: 1200px; margin: 0 auto; }
  
  .profile-header-card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid #f1f5f9; }
  .header-flex { display: flex; align-items: center; gap: 25px; position: relative; }
  
  .avatar-box { width: 100px; height: 100px; background: #1dbf73; color: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; }
  .avatar-shield { position: relative; }
  .status-dot { position: absolute; bottom: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; }
  .status-dot.online { background: #22c55e; }
  .status-dot.away { background: #cbd5e1; }

  .name-badge-row { display: flex; align-items: center; gap: 12px; }
  .role-chip { background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
  .meta-stats { display: flex; gap: 10px; margin-top: 10px; }
  .meta-pill { background: #f8fafc; padding: 6px 14px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #64748b; border: 1px solid #f1f5f9; }

  .btn-edit-profile { margin-left: auto; background: #fff; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; }
  .btn-edit-profile:hover { background: #f8fafc; border-color: #cbd5e1; }

  .dashboard-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; }
  .bento-card { background: white; padding: 20px; border-radius: 20px; border: 1px solid #f1f5f9; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
  .bento-card h3 { font-size: 1rem; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #f8fafc; padding-bottom: 10px; }

  .metrics-flex { display: flex; justify-content: space-around; padding: 10px 0; }
  .progress-circle { text-align: center; font-size: 0.75rem; font-weight: 600; color: #64748b; }
  .circular-chart { width: 80px; }
  .circle-bg { fill: none; stroke: #f1f5f9; stroke-width: 3; }
  .circle { fill: none; stroke-width: 3; stroke-linecap: round; }
  .circular-chart.green .circle { stroke: #1dbf73; }
  .circular-chart.blue .circle { stroke: #3b82f6; }
  .percentage { font-size: 0.5rem; font-weight: 800; text-anchor: middle; fill: #1e293b; }

  .client-stats-display { display: flex; justify-content: space-around; text-align: center; padding: 20px 0; }
  .big-stat strong { display: block; font-size: 2.5rem; color: #1dbf73; }
  .big-stat label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }

  .skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { background: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: #475569; }

  /* Modal Styling */
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); }
  .modal-content { background: white; padding: 35px; border-radius: 24px; width: 500px; max-width: 90%; }
  .edit-form label { display: block; margin: 15px 0 5px; font-weight: 600; font-size: 0.9rem; color: #475569; }
  .edit-form input, .edit-form textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; }
  .edit-form textarea { height: 100px; resize: none; }
  
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .toggle-box { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; background: #f8fafc; border-radius: 10px; }
  .toggle-switch { width: 40px; height: 20px; background: #cbd5e1; border-radius: 20px; position: relative; transition: 0.3s; }
  .toggle-switch.on { background: #1dbf73; }
  .toggle-switch:after { content: ''; position: absolute; width: 16px; height: 16px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: 0.3s; }
  .toggle-switch.on:after { left: 22px; }

  .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 25px; }
  .btn-cancel { background: #f1f5f9; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; }
  .btn-save { background: #1dbf73; color: white; border: none; padding: 12px 25px; border-radius: 10px; font-weight: 700; cursor: pointer; }
`;