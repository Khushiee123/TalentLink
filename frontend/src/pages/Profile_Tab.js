import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function ProfileTab({ profile, contracts, projects, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Identify role
  const isFreelancer = profile?.role?.toLowerCase() === "freelancer";

  // State for form
  const [formData, setFormData] = useState({
    bio: String(profile?.bio || ""),
    skills: String(profile?.skills || ""),
    location: String(profile?.location || ""),
    hourly_rate: String(profile?.hourly_rate || "0"),
    availability: profile?.availability ?? true,
  });

  // Sync state when profile prop changes (important for displaying edits)
  useEffect(() => {
    setFormData({
      bio: String(profile?.bio || ""),
      skills: String(profile?.skills || ""),
      location: String(profile?.location || ""),
      hourly_rate: String(profile?.hourly_rate || "0"),
      availability: profile?.availability ?? true,
    });
  }, [profile]);

  // --- CALCULATIONS ---
  const safeContracts = Array.isArray(contracts) ? contracts : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Project Volume Logic
  const totalCreated = safeProjects.length;
  const totalContracted = safeContracts.length;
  // Prevent division by zero; if they created projects, show the success rate
  const volumePercentage = totalCreated > 0 
    ? Math.min(Math.round((totalContracted / totalCreated) * 100), 100) 
    : 0;

  // Professional Network (Unique Contacts)
  const networkContacts = Array.from(new Set(
    safeContracts.map(c => isFreelancer ? c.client_username : c.freelancer_username)
  )).filter(Boolean);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await API.patch("/profile/", formData);
      if (response.status === 200) {
        onRefresh(); // Refetches data in Home.js to update the Summary/Skills UI
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="profile-dashboard-container fade-in">
      <style>{finalProfileStyles}</style>

      {/* --- TOP PROFILE HEADER --- */}
      <div className="header-glass-card">
        <div className="identity-flex">
          <div className="avatar-shield">
            <div className="letter-avatar">{profile.username?.charAt(0).toUpperCase()}</div>
            <div className={`status-dot ${formData.availability ? 'active' : 'busy'}`}></div>
          </div>
          <div className="id-info">
            <div className="name-row">
              <h1>{profile.username}</h1>
              <span className="role-tag">{profile.role}</span>
            </div>
            <p className="loc-tag">📍 {formData.location || "Global Remote"}</p>
          </div>
          <button className="edit-btn-pill" onClick={() => setIsModalOpen(true)}>Edit Profile</button>
        </div>
      </div>

      <div className="bento-grid-system">
        {/* --- SIDEBAR: STATS & NETWORK --- */}
        <div className="bento-sidebar">
          <div className="card-bento stat-highlight anim-pop">
            <h3>Project Volume</h3>
            <div className="chart-wrapper">
              <svg viewBox="0 0 36 36" className="circular-ring">
                <path className="ring-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="ring-progress" strokeDasharray={`${volumePercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage-text">{volumePercentage}%</text>
              </svg>
            </div>
            <p className="chart-caption">{totalContracted} contracted / {totalCreated} created</p>
          </div>

          <div className="card-bento network-list">
            <h3>Professional Network</h3>
            <div className="contacts-scroller">
              {networkContacts.length > 0 ? networkContacts.map((name, idx) => (
                <div key={idx} className="contact-row anim-slide-in" style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="small-avatar">{name.charAt(0)}</div>
                  <span className="contact-name">{name}</span>
                </div>
              )) : <p className="empty-txt">No connections yet.</p>}
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT: SUMMARY & SKILLS --- */}
        <div className="bento-main">
          <div className="card-bento content-area anim-fade-up">
            <h3>Summary</h3>
            <p className="summary-text">{formData.bio || "No summary provided. Tell the world what you do!"}</p>
          </div>

          <div className="card-bento content-area anim-fade-up" style={{animationDelay: '0.2s'}}>
            <h3>Skills & Expertise</h3>
            <div className="skill-tags-flex">
              {formData.skills ? formData.skills.split(",").map((s, i) => (
                <span key={i} className="modern-skill-tag">{s.trim()}</span>
              )) : <p className="empty-txt">No skills listed.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL FOR EDITING --- */}
      {isModalOpen && (
        <div className="modal-overlay-blur">
          <div className="modal-card anim-zoom">
            <div className="modal-header">
              <h2>Edit Profile Details</h2>
              <p>Update your public information and expertise.</p>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="input-field">
                <label>Professional Summary</label>
                <textarea 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  placeholder="Describe your background and value proposition..."
                />
              </div>
              <div className="input-grid">
                <div className="input-field">
                  <label>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="input-field">
                  <label>Skills (Comma Separated)</label>
                  <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Discard</button>
                <button type="submit" className="btn-save-glow">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const finalProfileStyles = `
  .profile-dashboard-container { padding: 30px; max-width: 1200px; margin: 0 auto; }

  /* Header Card */
  .header-glass-card { 
    background: white; padding: 40px; border-radius: 30px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.03); margin-bottom: 30px;
    border: 1px solid #f1f5f9;
  }
  .identity-flex { display: flex; align-items: center; gap: 30px; }
  .avatar-shield { position: relative; width: 100px; height: 100px; }
  .letter-avatar { 
    width: 100%; height: 100%; background: linear-gradient(135deg, #1abc9c, #16a085); 
    border-radius: 28px; color: white; display: flex; align-items: center; 
    justify-content: center; font-size: 3rem; font-weight: 800;
  }
  .status-dot { position: absolute; bottom: -4px; right: -4px; width: 22px; height: 22px; border: 4px solid white; border-radius: 50%; }
  .status-dot.active { background: #2ecc71; }
  .status-dot.busy { background: #94a3b8; }
  
  .name-row { display: flex; align-items: center; gap: 15px; margin-bottom: 5px; }
  .role-tag { background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
  .edit-btn-pill { margin-left: auto; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; }
  .edit-btn-pill:hover { background: #f1f5f9; transform: translateY(-2px); }

  /* Bento Layout */
  .bento-grid-system { display: grid; grid-template-columns: 1fr 2fr; gap: 25px; }
  .card-bento { background: white; padding: 25px; border-radius: 26px; border: 1px solid #f1f5f9; margin-bottom: 25px; }
  .card-bento h3 { font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 20px; border-bottom: 1px solid #f8fafc; padding-bottom: 10px; }

  /* Circular Progress Fix */
  .chart-wrapper { display: flex; justify-content: center; padding: 10px 0; }
  .circular-ring { width: 110px; height: 110px; } /* Explicit width/height to fix the black giant issue */
  .ring-track { fill: none; stroke: #f1f5f9; stroke-width: 3.5; }
  .ring-progress { fill: none; stroke: #1abc9c; stroke-width: 3.5; stroke-linecap: round; transition: stroke-dasharray 1s ease; }
  .percentage-text { font-size: 0.5rem; font-weight: 800; text-anchor: middle; fill: #1e293b; }
  .chart-caption { text-align: center; color: #64748b; font-size: 0.85rem; margin-top: 10px; }

  /* Network */
  .contact-row { display: flex; align-items: center; gap: 15px; padding: 10px; background: #f8fafc; border-radius: 15px; margin-bottom: 10px; }
  .small-avatar { width: 35px; height: 35px; background: #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
  .contact-name { font-weight: 600; font-size: 0.9rem; color: #334155; }

  /* Content Area */
  .summary-text { font-size: 1.1rem; line-height: 1.6; color: #475569; }
  .modern-skill-tag { background: #f1f5f9; padding: 8px 16px; border-radius: 12px; font-weight: 600; font-size: 0.9rem; margin: 4px; display: inline-block; color: #1e293b; border: 1px solid transparent; transition: 0.2s; }
  .modern-skill-tag:hover { border-color: #1abc9c; background: white; }

  /* Animations */
  @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .anim-slide-in { animation: slideIn 0.4s ease forwards; }

  /* Modal */
  .modal-overlay-blur { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
  .modal-card { background: white; width: 550px; padding: 40px; border-radius: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.2); }
  .input-field { margin-bottom: 20px; }
  .input-field label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; }
  .input-field input, .input-field textarea { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 14px; font-size: 1rem; }
  .input-field textarea { height: 100px; resize: none; }
  .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
  .btn-save-glow { background: #1abc9c; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(26, 188, 156, 0.4); }
`;