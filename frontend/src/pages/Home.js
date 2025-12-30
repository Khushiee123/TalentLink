import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", budget: "", duration: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await API.get("/profile/");
        setProfile(profileRes.data);
        const projectRes = await API.get("/projects/");
        setProjects(projectRes.data);
        
        const savedAvatar = localStorage.getItem(`avatar_${profileRes.data.username}`);
        if (savedAvatar) setSelectedAvatar(savedAvatar);
      } catch (err) {
        console.error("Fetch Error:", err);
        navigate("/");
      }
    };
    fetchData();
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result);
        localStorage.setItem(`avatar_${profile.username}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project.id);
      setFormData({ title: project.title, description: project.description, budget: project.budget, duration: project.duration });
    } else {
      setEditingProject(null);
      setFormData({ title: "", description: "", budget: "", duration: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await API.put(`/projects/${editingProject}/`, formData);
      } else {
        await API.post("/projects/", formData);
      }
      setIsModalOpen(false);
      const res = await API.get("/projects/");
      setProjects(res.data);
    } catch (err) {
      alert("Error saving project.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await API.delete(`/projects/${id}/`);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  if (!profile) return <div className="loading-screen"><h2>Loading Talent Link...</h2></div>;

  const avatarUrl = selectedAvatar || `https://ui-avatars.com/api/?name=${profile.username}&background=1abc9c&color=fff&size=128`;

  return (
    <div className="dashboard-root">
      <style>{`
        .dashboard-root { min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; background: #1abc9c; color: white; font-family: 'Poppins'; }
        
        /* Navbar Styling */
        .navbar { position: sticky; top: 0; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 2.5rem; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .nav-brand { font-size: 1.5rem; font-weight: 800; color: #1abc9c; letter-spacing: -0.5px; }
        .nav-links { display: flex; gap: 2rem; }
        .nav-btn { background: none; border: none; font-weight: 600; color: #64748b; cursor: pointer; padding: 1rem 0; transition: 0.2s; position: relative; }
        .nav-btn.active { color: #1abc9c; }
        .nav-btn.active::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: #1abc9c; border-radius: 10px; }
        .nav-user { display: flex; align-items: center; gap: 12px; }
        .nav-avatar-mini { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #e2e8f0; }

        /* Content Container */
        .content-container { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; }
        .welcome-header { margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
        .welcome-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; color: #0f172a; }
        .welcome-header p { color: #64748b; font-size: 1.1rem; }

        /* Project Cards */
        .btn-create { background: #1abc9c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(26, 188, 156, 0.2); }
        .btn-create:hover { background: #16a085; transform: translateY(-1px); }
        
        .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        .project-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; transition: 0.3s; }
        .project-card:hover { border-color: #1abc9c; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .card-price { color: #10b981; font-weight: 800; font-size: 1.25rem; }
        .card-actions { display: flex; gap: 10px; margin-top: 1.5rem; border-top: 1px solid #f1f5f9; paddingTop: 1rem; }
        .btn-edit { background: #fef9c3; color: #a16207; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }
        .btn-delete { background: #fee2e2; color: #b91c1c; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }

        /* Profile Section */
        .profile-card { background: white; max-width: 800px; margin: 0 auto; padding: 3rem; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .profile-header { text-align: center; margin-bottom: 2rem; }
        .avatar-wrapper { position: relative; width: 140px; height: 140px; margin: 0 auto 1.5rem; }
        .avatar-img { width: 100%; height: 100%; border-radius: 50%; border: 5px solid #f1f5f9; object-fit: cover; }
        .upload-badge { position: absolute; bottom: 5px; right: 5px; background: #1abc9c; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; cursor: pointer; }
        
        .modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background: white; padding: 2.5rem; border-radius: 20px; width: 100%; max-width: 450px; }
      `}</style>

      {/* NEW NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">TalentLink</div>
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={`nav-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>My Profile</button>
        </div>
        <div className="nav-user">
          <span style={{fontWeight: '600', color: '#475569'}}>{profile.username}</span>
          <img src={avatarUrl} className="nav-avatar-mini" alt="user" />
        </div>
      </nav>

      <main className="content-container">
        {activeTab === "dashboard" ? (
          <>
            <div className="welcome-header">
              <div>
                <h1>Project Dashboard</h1>
                <p>Track and manage your ongoing work with ease.</p>
              </div>
              <button className="btn-create" onClick={() => handleOpenModal()}>+ New Project</button>
            </div>

            <div className="project-grid">
              {projects.map(p => (
                <div key={p.id} className="project-card">
                  <div className="card-header">
                    <h3 style={{fontWeight: '700', fontSize: '1.2rem'}}>{p.title}</h3>
                    <span className="card-price">${p.budget}</span>
                  </div>
                  <p style={{color:'#64748b', fontSize:'0.95rem', lineHeight: '1.5'}}>{p.description}</p>
                  <div className="card-actions">
                    <button className="btn-edit" onClick={() => handleOpenModal(p)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <img src={avatarUrl} className="avatar-img" alt="profile" />
                <label htmlFor="avatar-upload" className="upload-badge">📷</label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{display: 'none'}} />
              </div>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>{profile.username}</h2>
              <span style={{background: '#ccfbf1', color: '#14b8a6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700'}}>{profile.role}</span>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem'}}>
              <div>
                <label style={{color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase'}}>Email Address</label>
                <p style={{fontWeight: '600', marginTop: '4px'}}>{profile.email}</p>
              </div>
              <div>
                <label style={{color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase'}}>Platform Role</label>
                <p style={{fontWeight: '600', marginTop: '4px'}}>Verified {profile.role}</p>
              </div>
            </div>
            <button 
              onClick={() => { localStorage.clear(); navigate("/"); }} 
              style={{marginTop: '3rem', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #fee2e2', color: '#ef4444', background: 'none', fontWeight: '700', cursor: 'pointer'}}
            >
              Sign Out of Account
            </button>
          </div>
        )}
      </main>

      {/* CRUD Modal remains functional but with updated styling */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{fontWeight: '800', marginBottom: '1.5rem'}}>{editingProject ? "Edit Project" : "Create New Project"}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input style={inputStyle} placeholder="Project Title" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} required />
              <textarea style={{...inputStyle, height: '100px'}} placeholder="Brief Description" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} required />
              <div style={{display: 'flex', gap: '1rem'}}>
                <input style={inputStyle} type="number" placeholder="Budget ($)" value={formData.budget} onChange={(e)=>setFormData({...formData, budget:e.target.value})} required />
                <input style={inputStyle} placeholder="Duration (e.g. 2 weeks)" value={formData.duration} onChange={(e)=>setFormData({...formData, duration:e.target.value})} required />
              </div>
              <div style={{display:'flex', gap:'12px', marginTop: '1rem'}}>
                <button type="submit" className="btn-create" style={{flex: 2}}>Save Project</button>
                <button type="button" onClick={()=>setIsModalOpen(false)} style={{flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer'}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  outline: 'none'
};