import React, { useState, useMemo, useEffect } from "react";
import API from "../../services/api";

const ProjectsTab = ({ projects, proposals, isClient, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // NEW: State for all available skills from the database
  const [allSkills, setAllSkills] = useState([]);
  
  // State for Success Feedback
  const [congratsData, setCongratsData] = useState({ show: false, title: "", message: "", emojis: [] });

  // State for Freelancer Application
  const [applyingProject, setApplyingProject] = useState(null);
  const [applyData, setApplyData] = useState({ 
    bid_amount: "", 
    cover_letter: "",
    deadline: "" 
  });

  const [formData, setFormData] = useState({
    title: "", description: "", budget: "", duration: "", skills: [] 
  });

  // Fetch all available skills for the selection list
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // Ensure this endpoint matches your backend (e.g., /api/skills/)
        const response = await API.get("/skills/");
        setAllSkills(response.data);
      } catch (err) {
        console.error("Error fetching global skills list", err);
      }
    };
    fetchSkills();
  }, []);

  // Global click listener to dismiss the success panel
  useEffect(() => {
    if (congratsData.show) {
      const closePanel = () => setCongratsData({ ...congratsData, show: false });
      const timer = setTimeout(() => {
        window.addEventListener("click", closePanel);
      }, 100);
      
      return () => {
        window.removeEventListener("click", closePanel);
        clearTimeout(timer);
      };
    }
  }, [congratsData]);

  const uniqueSkills = useMemo(() => {
    const skillsSet = new Set(["All"]);
    if (isClient) skillsSet.add("Assigned Projects");
    if (!isClient) skillsSet.add("Available for work");
    
    projects.forEach((p) => {
      if (!p.freelancer && p.skills) {
        p.skills.forEach(skill => skillsSet.add(skill));
      }
    });
    return Array.from(skillsSet);
  }, [projects, isClient]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const hasAcceptedProp = proposals.some(prop => prop.project === p.id && prop.status.toLowerCase() === "accepted");
    const isActuallyAssigned = !!p.freelancer || hasAcceptedProp;
    const hasApplied = proposals.some(prop => prop.project === p.id);

    let matchesFilter = false;
    if (selectedSkill === "All") {
      matchesFilter = !isActuallyAssigned && !hasApplied; 
    } else if (selectedSkill === "Assigned Projects") {
      matchesFilter = isActuallyAssigned; 
    } else if (selectedSkill === "Available for work") {
      matchesFilter = !isActuallyAssigned && !hasApplied;
    } else {
      matchesFilter = !isActuallyAssigned && !hasApplied && p.skills?.includes(selectedSkill);
    }
    return matchesSearch && matchesFilter;
  });

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        budget: project.budget,
        duration: project.duration,
        skills: project.skills || []
      });
    } else {
      setEditingProject(null);
      setFormData({ title: "", description: "", budget: "", duration: "", skills: [] });
    }
    setShowModal(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/proposals/", {
        project: applyingProject.id,
        bid_amount: parseFloat(applyData.bid_amount),
        cover_letter: applyData.cover_letter,
        deadline: applyData.deadline
      });
      setApplyingProject(null);
      setApplyData({ bid_amount: "", cover_letter: "", deadline: "" });
      
      setCongratsData({
        show: true,
        title: "Go Get 'Em!",
        message: "Your proposal was sent. Good luck on winning this project!",
        emojis: ["🚀", "💪", "🎯"]
      });

      onRefresh();
    } catch (err) {
      alert("Error submitting proposal: " + JSON.stringify(err.response?.data || "Check fields"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, budget: parseFloat(formData.budget) };
      if (editingProject) {
        await API.patch(`/projects/${editingProject.id}/`, payload);
      } else {
        await API.post("/projects/", payload);
        setCongratsData({
          show: true,
          title: "Congratulations!",
          message: "Your project is now live! Sit back and watch the experts apply.",
          emojis: ["🎉", "🎊", "✨"]
        });
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert("Error saving: " + JSON.stringify(err.response?.data || "Check Fields"));
    }
  };

  const toggleSkillSelection = (skillName) => {
    setFormData(prev => {
      const isSelected = prev.skills.includes(skillName);
      const newSkills = isSelected 
        ? prev.skills.filter(s => s !== skillName) 
        : [...prev.skills, skillName];
      return { ...prev, skills: newSkills };
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await API.delete(`/projects/${id}/`);
        onRefresh();
      } catch (err) {
        alert("Error deleting project.");
      }
    }
  };

  return (
    <div className="fade-in">
      <style>{congratsStyles}</style>

      {/* --- REUSABLE SUCCESS PANEL --- */}
      {congratsData.show && (
        <div className="congrats-panel-overlay">
          <div className="congrats-card scale-up">
            <div className="party-emoji-container">
              {congratsData.emojis.map((emoji, idx) => (
                <span key={idx} className={`emoji-anim delay-${idx}`}>{emoji}</span>
              ))}
            </div>
            <h3>{congratsData.title}</h3>
            <p>{congratsData.message}</p>
            <small>Click anywhere to dismiss</small>
          </div>
        </div>
      )}

      {/* View Header */}
      <div className="view-header">
        <div className="title-area">
          <h3>{selectedSkill === "Assigned Projects" ? "Assigned Projects" : "Available Projects"}</h3>
        </div>
        <div className="header-actions">
          <input 
            className="premium-search-input" 
            placeholder="Search projects..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <div className="skills-nav-container alignment-wrapper">
        <div className="skills-nav-scroll">
          {uniqueSkills.map(skill => (
            <button 
              key={skill} 
              onClick={() => setSelectedSkill(skill)} 
              className={`skill-nav-item ${selectedSkill === skill ? 'active' : ''}`}
            >
              {skill}
            </button>
          ))}
        </div>
        {isClient && (
          <button className="btn-post-project-inline" onClick={() => handleOpenModal()}>
            + Post Project
          </button>
        )}
      </div>

      {/* CLIENT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content premium-modal">
            <div className="modal-header">
              <h4>{editingProject ? "Edit Project Details" : "New Listing"}</h4>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Project Title</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Detailed Description</label>
                <textarea rows="4" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              {/* NEW SKILL SELECTION UI */}
              <div className="input-group">
  <label>Required Skills (Select multiple)</label>
  <div className="skills-selection-grid">
    {allSkills.length > 0 ? (
      allSkills.map(s => (
        <div 
          key={s.id} 
          className={`skill-tag-selectable ${formData.skills.includes(s.name) ? 'selected' : ''}`}
          onClick={() => toggleSkillSelection(s.name)}
        >
          {s.name}
        </div>
      ))
    ) : (
      <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>Loading available skills...</span>
    )}
  </div>
</div>

              <div className="form-row">
                <div className="input-group">
                  <label>Budget ($)</label>
                  <input type="number" required value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Duration</label>
                  <input type="text" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="btn-save-premium">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FREELANCER MODAL */}
      {applyingProject && (
        <div className="modal-overlay">
          <div className="modal-content premium-modal fade-in">
            <div className="modal-header">
              <h4>Submit Proposal</h4>
              <p>Applying for: <strong>{applyingProject.title}</strong></p>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>Your Bid Amount ($)</label>
                  <input type="number" required value={applyData.bid_amount} onChange={(e) => setApplyData({...applyData, bid_amount: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Proposed Deadline</label>
                  <input type="date" required min={new Date().toISOString().split("T")[0]} value={applyData.deadline} onChange={(e) => setApplyData({...applyData, deadline: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Cover Letter / Pitch</label>
                <textarea rows="5" required value={applyData.cover_letter} onChange={(e) => setApplyData({...applyData, cover_letter: e.target.value})} />
              </div>
              <div className="modal-actions-footer">
                <button type="button" className="btn-cancel" onClick={() => setApplyingProject(null)}>Cancel</button>
                <button type="submit" className="btn-save-premium">Send Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Grid */}
      <div className="project-grid">
        {filteredProjects.map(p => (
          <div key={p.id} className="premium-card">
            <div className="card-header-row">
              <h4>{p.title}</h4>
              <div className="card-price">${p.budget}</div>
            </div>
            <p className="card-desc">{p.description.substring(0, 120)}...</p>
            <div className="card-bottom">
              {p.freelancer ? (
                <div className="assigned-status-badge">Working with: <strong>{p.freelancer_username}</strong></div>
              ) : isClient ? (
                <div className="client-controls">
                  <button className="btn-edit" onClick={() => handleOpenModal(p)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              ) : (
                <button className="btn-apply-premium" onClick={() => setApplyingProject(p)}>Apply Now</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const congratsStyles = `
  .congrats-panel-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.3);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
  }
  .congrats-card {
    background: white; padding: 40px; border-radius: 30px;
    text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.2);
    max-width: 400px; border: 1px solid #eef2f6;
  }
  .party-emoji-container { font-size: 3.5rem; margin-bottom: 20px; display: flex; justify-content: center; gap: 15px; }
  .emoji-anim { display: inline-block; animation: bouncePop 0.8s ease infinite alternate; }
  .delay-1 { animation-delay: 0.2s; }
  .delay-2 { animation-delay: 0.4s; }
  @keyframes bouncePop {
    from { transform: scale(1) rotate(-10deg); }
    to { transform: scale(1.2) rotate(10deg) translateY(-10px); }
  }
  .scale-up { animation: scaleUpIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  @keyframes scaleUpIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .congrats-card h3 { color: #0f172a; font-size: 1.8rem; margin: 10px 0; font-weight: 800; }
  .congrats-card p { color: #475569; font-size: 1rem; line-height: 1.5; margin-bottom: 25px; }
  .congrats-card small { color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

  /* Skills Selection Grid Styles */
  .skills-selection-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    max-height: 150px;
    overflow-y: auto;
    padding: 10px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  .skill-tag-selectable {
    padding: 6px 14px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }
  .skill-tag-selectable:hover {
    border-color: #22c55e;
    color: #22c55e;
  }
  .skill-tag-selectable.selected {
    background: #22c55e;
    color: white;
    border-color: #22c55e;
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.2);
  }
`;

export default ProjectsTab;