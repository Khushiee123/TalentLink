import React, { useState } from "react";
import API from "../../services/api";

const DashboardTab = ({ proposals, isClient, onRefresh }) => {
  const [viewingProposal, setViewingProposal] = useState(null);
  const [ratingProposal, setRatingProposal] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const handlePrint = () => window.print();

  const handleRatingSubmit = async () => {
    if (!selectedRating) return;

    try {
      // 1. We use the 'API' service instead of 'fetch' to ensure the Authorization 
      // token is included and the baseURL (/api/) is handled.
      // 2. We change 'proposal_id' to 'contract' to match the Review model requirements.
      const response = await API.post('/reviews/', {
  contract: ratingProposal.contract_id, 
  rating: selectedRating,
  comment: reviewComment
});

      if (response.status === 201 || response.status === 200) {
        // 3. Refresh data in Home.js so stars update immediately
        await onRefresh(); 
        
        // 4. Reset Local UI States
        setRatingProposal(null);
        setSelectedRating(0);
        setReviewComment("");
        alert("Success! Review added to portfolio.");
      }
    } catch (error) {
      console.error("Failed to submit review:", error.response?.data || error);
      alert("Error: " + (error.response?.data?.contract || "Could not submit review."));
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex text-yellow-500" style={{ display: 'flex', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.round(rating) ? "star-filled" : "star-empty"}>
            {i < Math.round(rating) ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <style>{`
        .contract-branding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .logo-box-contract { background: #1abc9c; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 800; display: inline-block; }
        .logo-text-contract { display: inline-block; margin-left: 12px; font-size: 1.5rem; font-weight: 800; color: #1a202c; margin: 0; }
        .logo-text-contract span { color: #1abc9c; }
        .contract-type-badge { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; border: 1px solid #e2e8f0; padding: 4px 12px; border-radius: 20px; }
        .contract-divider { border: 0; border-top: 2px solid #f1f5f9; margin-bottom: 25px; }
        .star-filled { color: #ffc825; }
        .star-empty { color: #e2e8f0; }
        .rating-cell-container { display: flex; flex-direction: column; gap: 2px; }
        .avg-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
        
        /* Interactive Star Styles */
        .interactive-star { cursor: pointer; transition: transform 0.2s; font-size: 2.5rem; }
        .interactive-star:hover { transform: scale(1.2); }
        .review-textarea { width: 100%; margin-top: 15px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; min-height: 80px; font-family: inherit; }

        @media print {
          body * { visibility: hidden; }
          .report-overlay, .report-overlay * { visibility: visible; }
          .report-overlay { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="welcome-banner">
        <div className="banner-text">
          <h2>Activity Overview</h2>
          <p>Manage your professional pipeline in one place.</p>
        </div>
        <div className="banner-img">📊</div>
      </div>

      <div className="clean-table-container">
        <div className="table-header">
          <h3>Recent Proposals & Contracts</h3>
          <span className="count-pill">{proposals.length} Total</span>
        </div>
        
        <table className="premium-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Contact</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Rating & Reputation</th> 
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map(p => (
              <tr key={p.id} className="table-row">
                <td className="project-cell"><span className="p-title">{p.project_title || "Untitled"}</span></td>
                <td>{isClient ? p.freelancer_username : "Client"}</td>
                <td>${p.bid_amount}</td>
                <td><span className={`status-tag ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                <td>
                  <div className="rating-cell-container">
                    {isClient ? (
                      <>
                        <span className="avg-label">Freelancer Rank</span>
                        <StarRating rating={p.freelancer_avg_rating || 0} />
                        <span className="count-pill" style={{fontSize: '0.65rem'}}>Score: {p.freelancer_avg_rating || "N/A"}</span>
                      </>
                    ) : (
                      <>
                        <span className="avg-label">Project Rating</span>
                        {p.specific_rating ? <StarRating rating={p.specific_rating} /> : (
                          <span className="text-gray-400" style={{ fontSize: '0.75rem' }}>
                            {p.status === 'accepted' ? 'Awaiting Feedback' : '---'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="table-btn-ghost" onClick={() => setViewingProposal(p)}>Details</button>
                    {isClient && p.status === 'accepted' && !p.specific_rating && (
                      <button 
                        className="btn-print-premium" 
                        style={{ background: '#f39c12', padding: '5px 10px', fontSize: '0.7rem' }}
                        onClick={() => setRatingProposal(p)}
                      >
                        Rate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RATING MODAL */}
      {ratingProposal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box fade-in" style={{ maxWidth: '450px', textAlign: 'center', padding: '30px' }}>
            <h3>Review {ratingProposal.freelancer_username}</h3>
            <p className="text-gray-400">Share your experience for: <strong>{ratingProposal.project_title}</strong></p>
            
            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="interactive-star"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(star)}
                  style={{ color: star <= (hoverRating || selectedRating) ? '#ffc107' : '#e2e8f0' }}
                >
                  {star <= (hoverRating || selectedRating) ? '★' : '☆'}
                </span>
              ))}
            </div>

            <textarea 
              className="review-textarea"
              placeholder="What was it like working with this freelancer?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '25px', justifyContent: 'center' }}>
              <button className="table-btn-ghost" onClick={() => setRatingProposal(null)}>Cancel</button>
              <button 
                className="btn-print-premium" 
                disabled={!selectedRating}
                onClick={handleRatingSubmit}
              >
                Submit Verified Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS / PRINT MODAL */}
      {viewingProposal && (
        <div className="modal-overlay report-overlay">
          <div className="modal-box report-modal fade-in">
            <div className="report-header no-print">
              <div className="logo-text">Talent<span>Link</span> Report</div>
              <div className="report-actions">
                <button className="btn-print-premium" onClick={handlePrint}>🖨️ Print Report</button>
                <button className="btn-close-circle" onClick={() => setViewingProposal(null)}>✕</button>
              </div>
            </div>
            <div className="report-body">
              <div className="contract-branding-header">
                <div className="logo-container">
                  <div className="logo-box-contract">TL</div>
                  <h1 className="logo-text-contract">Talent<span>Link</span></h1>
                </div>
                <div className="contract-type-badge">Official Record</div>
              </div>
              <hr className="contract-divider" />
              <div className="report-section-header">
                <h4>Official Contract Agreement</h4>
                <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="report-grid">
                <div className="info-group"><label>Contract ID</label><p>TL-{viewingProposal.id}-2026</p></div>
                <div className="info-group"><label>Status</label><p style={{color: '#1dbf73', fontWeight: 'bold'}}>{viewingProposal.status}</p></div>
                <div className="info-group"><label>Provider</label><p>{viewingProposal.freelancer_username}</p></div>
                <div className="info-group"><label>Value</label><p className="price-text">${viewingProposal.bid_amount}</p></div>
              </div>
              <div className="report-footer-legal">
                <p>This is a digitally generated report from TalentLink. Verified professional agreement.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;