import React, { useState, useMemo } from "react";
import API from "../../services/api";

const ProjectsTab = ({ projects, proposals, isClient, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "", description: "", budget: "", duration: "", skills: [] 
  });

  // 1. Unified Navbar Logic - Including Assigned Projects for Clients
  const uniqueSkills = useMemo(() => {
    const skillsSet = new Set(["All"]);
    if (isClient) skillsSet.add("Assigned Projects"); // Client specific
    if (!isClient) skillsSet.add("Available for work"); // Freelancer specific
    
    projects.forEach((p) => {
      // Show skills from projects that aren't contracted yet
      if (!p.freelancer && p.skills) {
        p.skills.forEach(skill => skillsSet.add(skill));
      }
    });
    return Array.from(skillsSet);
  }, [projects, isClient]);

  // 2. Updated Filter Logic to handle "Assigned" visibility
const filteredProjects = projects.filter(p => {
  const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Logic: A project is "Assigned" if:
  // 1. It has a freelancer ID (Backend link)
  // 2. OR there is an 'Accepted' proposal for this project ID (Frontend link)
  const hasAcceptedProp = proposals.some(prop => prop.project === p.id && prop.status.toLowerCase() === "accepted");
  const isActuallyAssigned = !!p.freelancer || hasAcceptedProp;

  let matchesFilter = false;
  if (selectedSkill === "All") {
    matchesFilter = !isActuallyAssigned; 
  } else if (selectedSkill === "Assigned Projects") {
    matchesFilter = isActuallyAssigned; 
  } else {
    matchesFilter = !isActuallyAssigned && p.skills?.includes(selectedSkill);
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

  console.log("Total Projects:", projects.length);
  console.log("Assigned Projects Found:", projects.filter(p => !!p.freelancer).length);

  return (
    <div className="fade-in">
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

      {/* Button moved inside this container to align with the nav bar chips */}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content premium-modal">
            <div className="modal-header">
              <h4>{editingProject ? "Edit Project Details" : "New Listing"}</h4>
              <p>Update your project information and required skills.</p>
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
              </div>

              <div className="input-group">
                <label>Tag Required Skills</label>
                <div className="skill-selector-grid">
                  {uniqueSkills.filter(s => s !== "All" && s !== "Available for work" && s !== "Assigned Projects").map(s => (
                    <div 
                      key={s} 
                      className={`selectable-tag ${formData.skills.includes(s) ? 'selected' : ''}`}
                      onClick={() => toggleSkillSelection(s)}
                    >
                      {s}
                    </div>
                  ))}
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

      <div className="project-grid">
        {filteredProjects.map(p => (
          <div key={p.id} className="premium-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <h4>{p.title}</h4>
                {p.updated_at && p.created_at && p.updated_at !== p.created_at && (
                  <span className="edited-badge">EDITED</span>
                )}
              </div>
              <div className="card-price">${p.budget}</div>
            </div>
            
            <p className="card-desc">{p.description.substring(0, 120)}...</p>
            
            <div className="card-skills-wrapper">
              {p.skills && p.skills.length > 0 ? (
                p.skills.map(skill => <span key={skill} className="card-skill-tag">{skill}</span>)
              ) : (
                <span className="no-skills-text">No skills listed</span>
              )}
            </div>

            <div className="card-bottom">
              {p.freelancer ? (
                <div className="assigned-status-badge">
                   Working with: <strong>{p.freelancer_username || "Freelancer"}</strong>
                </div>
              ) : isClient ? (
                <div className="client-controls">
                  <button className="btn-edit" onClick={() => handleOpenModal(p)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              ) : (
                <button className="btn-apply-premium" onClick={() => alert("Apply logic")}>Apply Now</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsTab;