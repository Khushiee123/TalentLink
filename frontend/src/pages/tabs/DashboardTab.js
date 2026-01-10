import React, { useState } from "react";

const DashboardTab = ({ proposals, isClient, onRefresh }) => {
  const [viewingProposal, setViewingProposal] = useState(null);

  const handlePrint = () => window.print();

  return (
    <div className="fade-in">
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
                  <button className="table-btn-ghost" onClick={() => setViewingProposal(p)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRINT MODAL */}
      {viewingProposal && (
        <div className="modal-overlay report-overlay">
          <div className="modal-box report-modal fade-in">
            <div className="report-header no-print">
              <div className="logo-text">Talent<span>Link</span> Report</div>
              <div className="report-actions">
                <button className="btn-print-premium" onClick={handlePrint}>🖨️ Print</button>
                <button className="btn-close-circle" onClick={() => setViewingProposal(null)}>✕</button>
              </div>
            </div>
            <div className="report-body">
              <h4>Contract Agreement</h4>
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <div className="report-grid">
                <div className="info-group"><label>Project</label><p>{viewingProposal.project_title}</p></div>
                <div className="info-group"><label>Budget</label><p className="price-text">${viewingProposal.bid_amount}</p></div>
              </div>
              <div className="details-content">{viewingProposal.cover_letter}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;