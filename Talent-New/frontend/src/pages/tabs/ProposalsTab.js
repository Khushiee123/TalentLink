import React, { useState, useEffect } from "react";
import API from "../../services/api";

// --- SUB-COMPONENT: LIVE TIMER ---
const CountdownTimer = ({ deadline, status }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!deadline) return;
      
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft("Deadline crossed - contact to Client");
        setIsOverdue(true);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
        setIsOverdue(false);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [deadline]);

  // Hide timer if project is already submitted
  if (status?.toLowerCase() === "submitted") return null;

  return (
    <div className={`live-timer ${isOverdue ? "timer-red" : "timer-green"}`}>
      {timeLeft}
    </div>
  );
};

// --- MAIN COMPONENT ---
const ProposalsTab = ({ proposals, isClient, onRefresh }) => {
  const [viewingProposal, setViewingProposal] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");
  
  // Feature: Congratulations Popup State
  const [showCongrats, setShowCongrats] = useState(false);

  // Logic to auto-dismiss congratulations on any click
  useEffect(() => {
    if (showCongrats) {
      const closePopup = () => setShowCongrats(false);
      const timer = setTimeout(() => window.addEventListener("click", closePopup), 100);
      return () => {
        window.removeEventListener("click", closePopup);
        clearTimeout(timer);
      };
    }
  }, [showCongrats]);

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm("Confirm hiring this freelancer?")) return;
    try {
      await API.patch(`/proposals/${proposalId}/`, { status: 'accepted' });
      setShowCongrats(true); // Trigger the "Congratulations" popup
      onRefresh(); 
    } catch (err) {
      alert("Failed to accept proposal.");
    }
  };

  const handlePostProject = async (proposalId) => {
    if (!window.confirm("Mark this project as completed and submit to client?")) return;
    try {
      await API.patch(`/proposals/${proposalId}/`, { status: 'submitted' });
      alert("Project submitted successfully! 🚀");
      onRefresh();
    } catch (err) {
      alert("Failed to submit project.");
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
      <style>{customStyles}</style>

      {/* CONGRATULATIONS POPUP */}
      {showCongrats && (
        <div className="congrats-overlay">
          <div className="congrats-card scale-up">
            <div className="party-icon">🎉</div>
            <h3>Hiring Successful!</h3>
            <p>You have successfully hired a freelancer for your project.</p>
            <small>Click anywhere to dismiss</small>
          </div>
        </div>
      )}

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
              
              <div className="status-section">
                <div className={`p-status-badge ${p.status?.toLowerCase()}`}>{p.status}</div>
                {/* LIVE TIMER PLACEMENT */}
                {p.status?.toLowerCase() === 'accepted' && p.deadline && (
                    <CountdownTimer deadline={p.deadline} status={p.status} />
                )}
              </div>
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

              {/* POST PROJECT OPTION FOR FREELANCERS */}
              {!isClient && p.status === 'accepted' && (
                <button className="btn-post-project" onClick={() => handlePostProject(p.id)}>
                  Post Project
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

const customStyles = `
  .status-section { display: flex; flex-direction: column; align-items: flex-end; }
  .live-timer { font-size: 0.7rem; font-weight: 800; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
  .timer-green { color: #10b981; }
  .timer-red { color: #ef4444; animation: blink-red 1.5s infinite; }
  @keyframes blink-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  .congrats-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
  }
  .congrats-card {
    background: white; padding: 40px; border-radius: 24px; text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #f1f5f9;
  }
  .party-icon { font-size: 4rem; margin-bottom: 15px; }
  .btn-post-project { background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-right: 8px; }
  .scale-up { animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  @keyframes scaleIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
`;

export default ProposalsTab;