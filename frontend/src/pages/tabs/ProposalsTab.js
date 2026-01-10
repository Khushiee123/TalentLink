import React, { useState } from "react";
import API from "../../services/api";

const ProposalsTab = ({ proposals, isClient, onRefresh }) => {
  const [viewingProposal, setViewingProposal] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm("Confirm hiring this freelancer?")) return;
    try {
      await API.patch(`/proposals/${proposalId}/`, { status: 'accepted' });
      onRefresh(); // Refresh global data in Home.js
      alert("Hiring successful!");
    } catch (err) {
      alert("Failed to accept proposal.");
    }
  };

  const handleUpdateDeadline = async () => {
    try {
      await API.patch(`/proposals/${viewingProposal.id}/`, {
        deadline: newDeadline
      });
      alert("Deadline updated successfully!");
      setViewingProposal(null);
      onRefresh(); 
    } catch (err) {
      alert("Failed to update: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="proposals-container fade-in">
      <div className="proposals-grid">
        {proposals.map(p => (
          <div key={p.id} className="proposal-card">
            <div className="p-card-header">
              <div className="project-info">
                <span className="p-icon">📄</span>
                <div>
                  <h4>{p.project_title || "Project Proposal"}</h4>
                  <p className="p-user">From: {p.freelancer_username}</p>
                </div>
              </div>
              <div className={`p-status-badge ${p.status?.toLowerCase()}`}>{p.status}</div>
            </div>
            
            <div className="p-card-body">
              <div className="p-metric">
                <span className="p-label">Bid</span>
                <span className="p-value">${p.bid_amount}</span>
              </div>
              <div className="p-metric">
                <span className="p-label">Deadline</span>
                <span className="p-value">{p.deadline || "Not set"}</span>
              </div>
            </div>

            <div className="p-card-actions">
              {isClient && p.status === 'pending' && (
                <button className="btn-primary-hire" onClick={() => handleAcceptProposal(p.id)}>
                  Hire
                </button>
              )}
              <button 
                className="btn-secondary-outline"
                onClick={() => {
                  setViewingProposal(p);
                  setNewDeadline(p.deadline || "");
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PROPOSAL DETAIL & UPDATE MODAL */}
      {viewingProposal && (
        <div className="premium-modal-overlay" onClick={() => setViewingProposal(null)}>
          <div className="premium-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Proposal Details</h3>
              <button className="close-x" onClick={() => setViewingProposal(null)}>&times;</button>
            </div>
            <hr />
            
            <div className="modal-body">
              <div className="detail-item">
                <strong>Project:</strong>
                <p>{viewingProposal.project_title}</p>
              </div>

              <div className="detail-item">
                <strong>Cover Letter:</strong>
                <div className="p-cover-box">{viewingProposal.cover_letter}</div>
              </div>
              
              <div className="detail-item" style={{ marginTop: '20px' }}>
                <label><strong>Update Proposed Deadline:</strong></label>
                <input 
                  type="date" 
                  className="premium-input"
                  style={{ marginTop: '8px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setViewingProposal(null)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdateDeadline}>
                Update Deadline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsTab;