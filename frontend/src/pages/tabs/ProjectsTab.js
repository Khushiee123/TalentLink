import React, { useState, useMemo } from "react";
import API from "../../services/api";

const ProjectsTab = ({ projects, proposals, isClient, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // State for Freelancer Application
  const [applyingProject, setApplyingProject] = useState(null);
  const [applyData, setApplyData] = useState({ 
    bid_amount: "", 
    cover_letter: "",
    deadline: "" // New Deadline Field
  });

  const [formData, setFormData] = useState({
    title: "", description: "", budget: "", duration: "", skills: [] 
  });

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
  
  // 1. Check if the project is already assigned (Freelancer hired)
  const hasAcceptedProp = proposals.some(prop => prop.project === p.id && prop.status.toLowerCase() === "accepted");
  const isActuallyAssigned = !!p.freelancer || hasAcceptedProp;

  // 2. NEW: Check if the freelancer has already applied to this project
  // This looks through the proposals list for any entry matching this project ID
  const hasApplied = proposals.some(prop => prop.project === p.id);

  let matchesFilter = false;
  
  if (selectedSkill === "All") {
    // Hide if assigned OR if the freelancer already applied
    matchesFilter = !isActuallyAssigned && !hasApplied; 
  } else if (selectedSkill === "Assigned Projects") {
    matchesFilter = isActuallyAssigned; 
  } else if (selectedSkill === "Available for work") {
    // Specifically for freelancers: hide already applied projects
    matchesFilter = !isActuallyAssigned && !hasApplied;
  } else {
    // Skill-specific filtering
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

  // Handle Proposal Submission with Deadline
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/proposals/", {
        project: applyingProject.id,
        bid_amount: parseFloat(applyData.bid_amount),
        cover_letter: applyData.cover_letter,
        deadline: applyData.deadline // Sending deadline to backend
      });
      setApplyingProject(null);
      setApplyData({ bid_amount: "", cover_letter: "", deadline: "" });
      alert("Proposal submitted successfully!");
      onRefresh();
    } catch (err) {
      alert("Error submitting proposal: " + JSON.stringify(err.response?.data || "Check fields"));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, budget: parseFloat(formData.budget) };
      if (editingProject) {
        await API.patch(`/projects/${editingProject.id}/`, payload);
      } else {
        await API.post("/projects/", payload);
      }
      setShowModal(false);
      onRefresh();
    } catch (err) {
      alert("Error saving: " + JSON.stringify(err.response?.data || "Check Fields"));
    }
  };

  return (
    <div className="fade-in">
      {/* Search and Navigation Bar */}
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

      {/* CLIENT: POST/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content premium-modal">
            <div className="modal-header">
              <h4>{editingProject ? "Edit Project Details" : "New Listing"}</h4>
              <p>Update project requirements and budget.</p>
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
              <div className="form-row">
                <div className="input-group">
                  <label>Budget ($)</label>
                  <input type="number" required value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Duration</label>
                  <input type="text" required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                </div>
                <div className="input-group" style={{ marginTop: '15px' }}>
  <label>Required Skills (Select multiple)</label>
  <div className="skills-selection-grid" style={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '8px', 
    marginTop: '10px' 
  }}>
    {uniqueSkills.filter(s => s !== "All" && s !== "Assigned Projects" && s !== "Available for work").map(skill => (
      <button
        key={skill}
        type="button"
        onClick={() => toggleSkillSelection(skill)}
        className={`skill-nav-item ${formData.skills.includes(skill) ? 'active' : ''}`}
        style={{ fontSize: '0.8rem', padding: '5px 12px' }}
      >
        {skill} {formData.skills.includes(skill) ? '✓' : '+'}
      </button>
    ))}
  </div>
</div>
              </div>
              <div className="modal-actions-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="btn-save-premium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FREELANCER: ENHANCED APPLY MODAL WITH DEADLINE */}
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
                  <input 
                    type="number" 
                    required 
                    placeholder={`Budget: $${applyingProject.budget}`}
                    value={applyData.bid_amount} 
                    onChange={(e) => setApplyData({...applyData, bid_amount: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Proposed Deadline</label>
                  <input 
                    type="date" 
                    required 
                    min={new Date().toISOString().split("T")[0]} // Prevents selecting past dates
                    value={applyData.deadline} 
                    onChange={(e) => setApplyData({...applyData, deadline: e.target.value})} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Cover Letter / Pitch</label>
                <textarea 
                  rows="5" 
                  required 
                  placeholder="Introduce yourself and explain why you're perfect for this project..."
                  value={applyData.cover_letter} 
                  onChange={(e) => setApplyData({...applyData, cover_letter: e.target.value})} 
                />
              </div>
              <div className="modal-actions-footer">
                <button type="button" className="btn-cancel" onClick={() => setApplyingProject(null)}>Cancel</button>
                <button type="submit" className="btn-save-premium">Send Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Grid Display */}
      <div className="project-grid">
        {filteredProjects.map(p => (
          <div key={p.id} className="premium-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h4>{p.title}</h4>
              </div>
              <div className="card-price">${p.budget}</div>
            </div>
            <p className="card-desc">{p.description.substring(0, 120)}...</p>
            <div className="card-skills-wrapper">
              {p.skills?.map(skill => <span key={skill} className="card-skill-tag">{skill}</span>)}
            </div>
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

export default ProjectsTab;