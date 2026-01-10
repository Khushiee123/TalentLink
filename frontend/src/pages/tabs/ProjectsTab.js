import React, { useState } from "react";
import API from "../../services/api";

const ProjectsTab = ({ projects, proposals, isClient, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleApply = async (p) => {
    const userMessage = window.prompt(`Apply for "${p.title}"?`, "I'm interested!");
    if (!userMessage) return;
    
    const userDeadline = window.prompt("Deadline? (YYYY-MM-DD)", "2026-01-30");
    if (!userDeadline) return;

    try {
      await API.post("/proposals/", {
        project: p.id,
        bid_amount: parseFloat(p.budget),
        cover_letter: userMessage,
        deadline: userDeadline,
        status: 'pending'
      });
      alert("Applied!");
      onRefresh(); 
    } catch (err) {
      alert(err.response?.status === 500 ? "Already applied!" : "Error submitting.");
    }
  };

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !proposals.some(prop => prop.project === p.id)
  );

  return (
    <div className="fade-in">
      <div className="view-header">
        <div className="title-area"><h3>Available Projects</h3></div>
        <div className="search-wrapper">
          <input 
            className="premium-search-input" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>
      <div className="project-grid">
        {filtered.map(p => (
          <div key={p.id} className="premium-card">
            <h4>{p.title}</h4>
            <p className="card-desc">{p.description.substring(0, 100)}...</p>
            <div className="card-bottom">
              <div className="card-price">${p.budget}</div>
              {!isClient && <button className="btn-primary-sm" onClick={() => handleApply(p)}>Apply</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsTab;