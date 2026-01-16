import React, { useState, useEffect } from "react";
import API from "../services/api";

// High-quality dummy avatars for the identity picker
const DUMMY_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=James&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sophie&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mimi&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Lily&backgroundColor=f8fafc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Bella&backgroundColor=f8fafc"
];

export default function ProfileTab({ profile, contracts, projects, onRefresh }) {
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'output', or null

  const [formData, setFormData] = useState({
    bio: String(profile?.bio || ""),
    skills: String(profile?.skills || ""),
    location: String(profile?.location || ""),
    useAvatar: profile?.useAvatar ?? false,
    selectedAvatar: profile?.avatar_url || DUMMY_AVATARS[0],
    newOutputTitle: "",
    newOutputLink: ""
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      bio: String(profile?.bio || ""),
      skills: String(profile?.skills || ""),
      location: String(profile?.location || ""),
      useAvatar: profile?.useAvatar ?? false,
      selectedAvatar: profile?.avatar_url || DUMMY_AVATARS[0],
    }));
  }, [profile]);

  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      bio: formData.bio,
      skills: formData.skills,
      location: formData.location,
      // CRITICAL: Ensure these fields are sent
      useAvatar: formData.useAvatar,
      avatar_url: formData.selectedAvatar 
    };

    const response = await API.patch("/profile/", payload);
    
    if (response.status === 200) {
      // 1. Refresh parent data to get the latest from Database
      onRefresh(); 
      
      // 2. Explicitly update local state with the saved values 
      // so the UI doesn't flicker back to the old state
      setFormData(prev => ({
        ...prev,
        useAvatar: response.data.useAvatar,
        selectedAvatar: response.data.avatar_url
      }));

      setActiveModal(null);
    }
  } catch (err) {
    console.error("Update failed", err);
  }
};

  return (
    <div className="profile-dashboard-container fade-in">
      <style>{finalStyles}</style>

      {/* --- TOP IDENTITY SECTION --- */}
      <div className="profile-header-card">
        <div className="identity-flex">
          <div className="avatar-shield">
  {/* Use the formData state here so it reflects changes immediately */}
  {formData.useAvatar ? (
    <img src={formData.selectedAvatar} alt="Profile Avatar" className="img-avatar" />
  ) : (
    <div className="letter-avatar">{profile.username?.charAt(0).toUpperCase()}</div>
  )}
  <div className="status-dot active"></div>
</div>
          <div className="id-info">
            <div className="name-row">
              <h1>{profile.username}</h1>
              <span className="role-badge">{profile.role}</span>
            </div>
            <p className="location-text">📍 {formData.location || "Remote / Global"}</p>
          </div>
          <button className="btn-main-edit" onClick={() => setActiveModal('profile')}>
            Edit Dashboard
          </button>
        </div>
      </div>

      <div className="bento-grid-system">
        <div className="bento-main">
          {/* ABOUT SECTION */}
          <div className="card-bento">
            <div className="card-header-flex">
              <h3>Professional Summary</h3>
              <span className="quick-edit" onClick={() => setActiveModal('profile')}>Edit</span>
            </div>
            <p className="bio-display">{formData.bio || "Write something about yourself..."}</p>
          </div>

          {/* EXPERTISE SECTION */}
          <div className="card-bento">
            <div className="card-header-flex">
              <h3>Expertise & Skills</h3>
              <span className="quick-edit" onClick={() => setActiveModal('profile')}>Edit</span>
            </div>
            <div className="skill-cloud">
              {formData.skills ? formData.skills.split(",").map((s, i) => (
                <span key={i} className="skill-tag">{s.trim()}</span>
              )) : <p className="empty-txt">No skills added yet.</p>}
            </div>
          </div>

          {/* PROJECT OUTPUT SHOWCASE */}
          <div className="card-bento">
            <div className="card-header-flex">
              <h3>Live Project Outputs</h3>
              <button className="btn-add-mini" onClick={() => setActiveModal('output')}>+ Post Output</button>
            </div>
            <div className="outputs-grid">
              {projects?.length > 0 ? projects.map((p, i) => (
                <div key={i} className="output-card">
                  <div className="output-icon">🔗</div>
                  <div className="output-details">
                    <strong>{p.title}</strong>
                    <a href={p.output_link} target="_blank" rel="noreferrer">Open Project ↗</a>
                  </div>
                </div>
              )) : <p className="empty-txt">No live outputs showcased yet.</p>}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="bento-sidebar">
          <div className="card-bento stats-box">
            <h3>Overview</h3>
            <div className="stat-line"><span>Total Projects</span> <strong>{projects?.length || 0}</strong></div>
            <div className="stat-line"><span>Contracts</span> <strong>{contracts?.length || 0}</strong></div>
          </div>
        </div>
      </div>

      {/* --- MODAL: EDIT DASHBOARD (General) --- */}
      {activeModal === 'profile' && (
        <div className="modal-overlay">
          <div className="modal-box scale-up">
            <div className="modal-header">
              <h2>Edit General Profile</h2>
              <button className="close-x" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="avatar-picker-box">
                <label className="picker-label">Identity Visual</label>
                <div className="toggle-row">
                  <span className={!formData.useAvatar ? 'active' : ''}>Initial Logo</span>
                  <div className={`toggle-btn ${formData.useAvatar ? 'on' : ''}`} onClick={() => setFormData({...formData, useAvatar: !formData.useAvatar})}>
                    <div className="toggle-knob"></div>
                  </div>
                  <span className={formData.useAvatar ? 'active' : ''}>Avatar</span>
                </div>
                {formData.useAvatar && (
                  <div className="avatar-selection-grid">
                    {DUMMY_AVATARS.map((url, i) => (
                      <div key={i} className={`av-choice ${formData.selectedAvatar === url ? 'selected' : ''}`} onClick={() => setFormData({...formData, selectedAvatar: url})}>
                        <img src={url} alt="option" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-field">
                <label>About Me</label>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
              <div className="form-field">
                <label>Skills (comma separated)</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
              </div>
              <button type="submit" className="btn-submit-full">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: POST OUTPUT --- */}
      {activeModal === 'output' && (
        <div className="modal-overlay">
          <div className="modal-box scale-up">
            <div className="modal-header">
              <h2>Post Live Project Output</h2>
              <button className="close-x" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-field">
                <label>Project Title</label>
                <input type="text" value={formData.newOutputTitle} onChange={e => setFormData({...formData, newOutputTitle: e.target.value})} placeholder="e.g. Portfolio Website" />
              </div>
              <div className="form-field">
                <label>Live URL</label>
                <input type="text" value={formData.newOutputLink} onChange={e => setFormData({...formData, newOutputLink: e.target.value})} placeholder="https://github.com/..." />
              </div>
              <button type="submit" className="btn-submit-full">Add Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const finalStyles = `
  .profile-dashboard-container { padding: 30px; max-width: 1100px; margin: 0 auto; font-family: 'Inter', sans-serif; }
  .profile-header-card { background: white; padding: 30px; border-radius: 20px; border: 1px solid #eef2f6; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
  .identity-flex { display: flex; align-items: center; gap: 20px; }
  .avatar-shield { width: 80px; height: 80px; position: relative; }
  .img-avatar { width: 100%; height: 100%; border-radius: 18px; object-fit: cover; background: #f8fafc; }
  .letter-avatar { width: 100%; height: 100%; background: #4f46e5; color: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; }
  .status-dot { position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; border: 3px solid white; border-radius: 50%; background: #10b981; }
  .btn-main-edit { margin-left: auto; background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; }

  .bento-grid-system { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
  .card-bento { background: white; padding: 24px; border-radius: 20px; border: 1px solid #eef2f6; margin-bottom: 24px; }
  .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
  .card-bento h3 { font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
  .quick-edit { font-size: 0.7rem; color: #4f46e5; cursor: pointer; font-weight: 700; }

  .outputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .output-card { display: flex; align-items: center; gap: 12px; padding: 15px; background: #f8fafc; border-radius: 12px; }
  .output-details a { font-size: 0.75rem; color: #4f46e5; text-decoration: none; font-weight: 700; display: block; }
  
  .skill-tag { display: inline-block; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; margin: 4px; font-size: 0.85rem; font-weight: 500; }

  /* MODALS */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 999; }
  .modal-box { background: white; width: 480px; padding: 30px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
  .modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .form-field { margin-bottom: 15px; }
  .form-field label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; }
  input, textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px; }
  .btn-submit-full { width: 100%; background: #4f46e5; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 10px; }

  /* AVATAR PICKER */
  .avatar-picker-box { background: #f8fafc; padding: 15px; border-radius: 15px; margin-bottom: 20px; }
  .toggle-row { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; font-weight: 700; color: #94a3b8; margin-bottom: 15px; }
  .toggle-row .active { color: #4f46e5; }
  .toggle-btn { width: 40px; height: 20px; background: #cbd5e1; border-radius: 20px; position: relative; cursor: pointer; }
  .toggle-btn.on { background: #4f46e5; }
  .toggle-knob { width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.2s; }
  .toggle-btn.on .toggle-knob { left: 22px; }
  .avatar-selection-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
  .av-choice { border: 2px solid transparent; border-radius: 8px; cursor: pointer; transition: 0.2s; }
  .av-choice.selected { border-color: #4f46e5; transform: scale(1.1); }
  .av-choice img { width: 100%; border-radius: 6px; }

  /* ===================================== */
/* PROFILE TAB — DARK THEME ONLY */
/* ===================================== */

body.dark-theme .profile-dashboard-container {
  color: #e5e7eb;
}

/* ---------- Header Card ---------- */
body.dark-theme .profile-header-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  box-shadow: none;
}

body.dark-theme .status-dot {
  border-color: #0f172a;
}

/* Edit Button */
body.dark-theme .btn-main-edit {
  background: #22c55e;
  color: #052e16;
}

/* ---------- Bento Cards ---------- */
body.dark-theme .card-bento {
  background: #0f172a;
  border: 1px solid #1e293b;
}

body.dark-theme .card-bento h3 {
  color: #94a3b8;
}

body.dark-theme .quick-edit {
  color: #38bdf8;
}

/* ---------- Output Cards ---------- */
body.dark-theme .output-card {
  background: #1e293b;
}

body.dark-theme .output-details a {
  color: #38bdf8;
}

/* ---------- Skill Tags ---------- */
body.dark-theme .skill-tag {
  background: #1e293b;
  color: #e5e7eb;
}

/* ---------- Modal ---------- */
body.dark-theme .modal-overlay {
  background: rgba(0, 0, 0, 0.6);
}

body.dark-theme .modal-box {
  background: #0f172a;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}

body.dark-theme .modal-header {
  color: #f8fafc;
}

/* ---------- Form Fields ---------- */
body.dark-theme .form-field label {
  color: #cbd5e1;
}

body.dark-theme input,
body.dark-theme textarea {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
}

body.dark-theme input::placeholder,
body.dark-theme textarea::placeholder {
  color: #94a3b8;
}

/* Submit Button */
body.dark-theme .btn-submit-full {
  background: #22c55e;
  color: #052e16;
}

/* ---------- Avatar Picker ---------- */
body.dark-theme .avatar-picker-box {
  background: #1e293b;
}

body.dark-theme .toggle-row {
  color: #94a3b8;
}

body.dark-theme .toggle-row .active {
  color: #38bdf8;
}

body.dark-theme .toggle-btn {
  background: #334155;
}

body.dark-theme .toggle-btn.on {
  background: #22c55e;
}

body.dark-theme .toggle-knob {
  background: #f8fafc;
}

/* Avatar selection */
body.dark-theme .av-choice.selected {
  border-color: #22c55e;
}

`;