import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ProfileTab from "./Profile_Tab";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [viewingProposal, setViewingProposal] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [messages, setMessages] = useState([]); // This stores the chat history
  const [chatInput, setChatInput] = useState(""); // This handles the text in the input box
  const fetchMessages = async () => {
  if (!selectedContract) return;

  try {
    // Replace "/messages/" with your actual endpoint if different
    // We filter by contract ID to get only the messages for the active chat
    const response = await API.get(`/messages/?contract=${selectedContract.id}`);
    setMessages(response.data);
  } catch (err) {
    console.error("Error fetching messages:", err);
  }
};

  // FIXED: Moved these hooks out of the filter and to the top level
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // FIXED: Cleaned up the filteredProjects logic
  const filteredProjects = projects.filter(project => {
    const hasApplied = proposals.some(proposal => proposal.project === project.id);
    return !hasApplied;
  });

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, projectRes, propRes, contRes] = await Promise.all([
        API.get("/profile/"), API.get("/projects/"),
        API.get("/proposals/"), API.get("/contracts/")
      ]);
      setProfile(profileRes.data);
      setProjects(projectRes.data);
      setProposals(propRes.data);
      setContracts(contRes.data);
    } catch (err) { if (err.response?.status === 401) navigate("/"); }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm("Confirm hiring this freelancer?")) return;
    try {
      await API.patch(`/proposals/${proposalId}/`, { status: 'accepted' });
      fetchData();
      alert("Hiring successful!");
    } catch (err) { alert("Failed to accept proposal."); }
  };

  const handlePrint = () => {
  window.print();
};

const handleApply = async (p) => {
  // 1. Capture the Cover Letter
  const userMessage = window.prompt(`Apply for "${p.title}"?`, "I'm interested!");
  
  if (userMessage) {
    // 2. Capture the Deadline (New Field)
    const userDeadline = window.prompt("Proposed completion date? (YYYY-MM-DD)", "2026-01-30");
    
    if (userDeadline) {
      try {
        await API.post("/proposals/", {
          project: p.id,
          bid_amount: parseFloat(p.budget),
          cover_letter: userMessage,
          deadline: userDeadline, // Added this field
          status: 'pending'
        });
        
        alert("Application successful!");
        fetchData(); 
      } catch (err) {
        console.error("Submission Error:", err.response?.data);
        
        // Handle the IntegrityError (Duplicate) or Missing Field errors
        if (err.response?.status === 500) {
          alert("You have already applied to this project!");
        } else {
          // This will show exactly what field is wrong (e.g., date format error)
          alert("Error: " + JSON.stringify(err.response?.data));
        }
      }
    }
  }
};

const handleUpdateDeadline = async () => {
  try {
    await API.patch(`/proposals/${viewingProposal.id}/`, {
      deadline: newDeadline
    });
    alert("Deadline updated successfully!");
    setViewingProposal(null); // Close modal
    fetchData(); // Refresh list
  } catch (err) {
    console.error(err);
    alert("Failed to update deadline.");
  }
};

const handleSendMessage = async () => {
  if (!chatInput.trim() || !selectedContract) return;

  const newMessage = {
    contract: selectedContract.id,
    content: chatInput,
    // Ensure the sender ID is automatically handled by your backend auth
  };

  try {
    // 1. Send to Backend
    const response = await API.post("/messages/", newMessage);
    
    // 2. Update local UI
    setMessages([...messages, response.data]);
    setChatInput("");
  } catch (err) {
    console.error("Message failed to send:", err);
  }
};

useEffect(() => {
  // Fetch messages immediately
  fetchMessages();

  // Check for new messages every 5 seconds
  const interval = setInterval(() => {
    if (selectedContract) {
      fetchMessages();
    }
  }, 5000);

  return () => clearInterval(interval);
}, [selectedContract]);

  if (!profile) return (
    <div className="loading-screen">
      <div className="loader-bar"></div>
    </div>
  );

  const isClient = profile.role?.toLowerCase() === "client";

  return (
    <div className="app-shell">
      <style>{premiumStyles}</style>

      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="brand-box">
          <div className="logo-icon">TL</div>
          <div className="logo-text">Talent<span>Link</span></div>
        </div>
        
        <nav className="side-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">🏠</span> Dashboard
          </button>
          <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>
            <span className="icon">💼</span> Projects
          </button>
          <button className={activeTab === 'proposals' ? 'active' : ''} onClick={() => setActiveTab('proposals')}>
            <span className="icon">📩</span> Proposals
          </button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            <span className="icon">💬</span> Messages
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-card" onClick={() => {localStorage.clear(); navigate("/");}}>
            Logout <span>→</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="breadcrumb">TalentLink / {activeTab}</p>
          </div>
          <div className="header-right">
  {/* Add onClick and a pointer cursor style */}
  <div 
    className="user-profile-summary" 
    onClick={() => setActiveTab('profile')} 
    style={{ cursor: 'pointer' }}
    title="View Profile"
  >
    <img src={`https://ui-avatars.com/api/?name=${profile.username}&background=1dbf73&color=fff`} alt="Avatar" />
    <div className="user-name-text">
      <span className="name">{profile.username}</span>
      <span className="role">{profile.role}</span>
    </div>
  </div>
</div>
        </header>

        {/* Add this block to display your ProfileTab file */}
  {activeTab === 'profile' && (
    <ProfileTab 
      profile={profile} 
      contracts={contracts} 
      proposals={proposals} 
      onRefresh={fetchData} // Replace 'fetchData' with your main data fetching function name
    />
  )}

        <div className="scroll-content">
          
          {activeTab === "dashboard" && (
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
          {proposals.length > 0 ? proposals.map(p => (
            <tr key={p.id} className="table-row">
              <td className="project-cell">
                <span className="p-title">{p.project_title || "Untitled Project"}</span>
              </td>
              <td className="contact-cell">
                {isClient ? p.freelancer_username : "Client"}
              </td>
              <td className="amount-cell">${p.bid_amount}</td>
              <td>
                <span className={`status-tag ${p.status?.toLowerCase()}`}>
                  {p.status}
                </span>
              </td>
              <td>
                {isClient && p.status === 'pending' ? (
                  <button className="table-btn-primary" onClick={() => handleAcceptProposal(p.id)}>Hire</button>
                ) : (
                  <button 
  className="table-btn-ghost" 
  onClick={() => {
    // We create a clean object for the modal
    const reportData = {
      ...p,
      // If freelancer_username is empty, we try freelancer_name 
      // or whatever variable your table's "Freelancer" column is using.
      displayName: p.freelancer_username || p.freelancer_name || `User #${p.freelancer}`
    };
    setViewingProposal(reportData);
  }}
>
  View Details
</button>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="empty-table">No history found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}


{/*MODAL FOR PRINT THE CONTRACT*/}
{viewingProposal && (
  <div className="modal-overlay report-overlay">
    <div className="modal-box report-modal fade-in">
      <div className="report-header no-print">
  <div className="brand-box">
    <div className="logo-icon">TL</div>
    <div className="logo-text">Talent<span>Link</span> <span>Report</span></div>
  </div>
  <div className="report-actions">
    <button className="btn-print-premium" onClick={handlePrint} title="Print Report">
      <span className="icon">🖨️</span> Print / Save
    </button>
    <button className="btn-close-circle" onClick={() => setViewingProposal(null)} title="Close">
      <span className="close-icon">✕</span>
    </button>
  </div>
</div>

      <div className="report-body" id="printable-report">
        <div className="report-section">
          <h4>Contract Agreement</h4>
          <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="report-grid">
          <div className="info-group">
            <label>Project Title</label>
            <p>{viewingProposal.project_title || "Standard Project"}</p>
          </div>
          <div className="info-group">
            <label>Contract Status</label>
            <p className={`status-text ${viewingProposal.status}`}>{viewingProposal.status}</p>
          </div>
          <div className="info-group">
  <label>Contractor/Freelancer</label>
  <p>{viewingProposal.displayName}</p>
</div>
          <div className="info-group">
            <label>Agreed Budget</label>
            <p className="price-text">${viewingProposal.bid_amount}</p>
          </div>
        </div>

        <div className="report-details">
          <label>Proposal Cover Letter / Terms</label>
          <div className="details-content">
            {viewingProposal.cover_letter || "This contract is governed by the terms of TalentLink. Both parties agree to the scope and budget defined above."}
          </div>
        </div>

        <div className="report-footer">
          <p>Digital Signature ID: {viewingProposal.id}-{Date.now()}</p>
        </div>
      </div>
    </div>
  </div>
)}


{/*PROJECTS TAB*/}
{activeTab === "projects" && (
  <div className="fade-in">
    <div className="view-header">
      <div className="title-area">
        <h3>Available Projects</h3>
        {/* We calculate the count based on the filtered list */}
        <p className="subtitle">
          {projects.filter(p => 
            !proposals.some(prop => prop.project === p.id) && 
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length} fresh opportunities found
        </p>
      </div>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input 
          className="premium-search-input" 
          placeholder="Search by title..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>
    </div>

    <div className="project-grid">
      {projects
  .filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const hasNoProposal = !proposals.some(prop => prop.project === p.id);
    return matchesSearch && hasNoProposal;
  })
  .map(p => (
    <div key={p.id} className="premium-card project-card-animate">
      <div className="card-top">
        <span className="type-pill">{p.duration || 'Fixed Price'}</span>
        <span className="category-tag-sm">NEW</span>
      </div>
      <h4>{p.title}</h4>
      <p className="card-desc">{p.description.substring(0, 100)}...</p>
      <div className="card-bottom">
        <div className="card-price">${p.budget}</div>
        
        {/* FIX: Only show Apply button for Freelancers */}
        {!isClient && (
          <button 
  className="btn-primary-sm" 
  onClick={async () => {
    // 1. Ask for a message
    const userMessage = window.prompt(`Apply for "${p.title}"?`, "I'm interested!");
    
    if (userMessage) { 
      try {
        await API.post("/proposals/", {
          project: p.id,
          bid_amount: parseFloat(p.budget), 
          cover_letter: userMessage, 
          status: 'pending'
        });
        
        alert("Application successful!");
        fetchData(); 
      } catch (err) {
        // 2. Check for the IntegrityError/Duplicate
        if (err.response?.status === 500 || err.response?.data?.includes("IntegrityError")) {
          alert("You have already applied to this project!");
        } else {
          console.error("Submission Error:", err.response?.data);
          alert("Submission failed. Check console for details.");
        }
      }
    }
  }}
>
  Apply Now
</button>
        )}
      </div>
    </div>
  ))}
      
      {/* Empty State: Shown if filtering leaves 0 results */}
      {projects.filter(p => !proposals.some(prop => prop.project === p.id)).length === 0 && (
        <div className="empty-projects-placeholder">
          <div className="check-icon">✨</div>
          <h4>You're all caught up!</h4>
          <p>You have submitted proposals for all available projects.</p>
        </div>
      )}
    </div>
  </div>
)}


{activeTab === "proposals" && (
  <div className="proposals-container fade-in">
    {/* 1. Grid of Proposal Cards */}
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

    {/* 2. Proposal Detail & Update Modal */}
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
            
            <div className="detail-item">
              <label><strong>Proposed Deadline:</strong></label>
              <input 
                type="date" 
                className="premium-input"
                style={{ marginTop: '8px', width: '100%' }}
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary-outline" onClick={() => setViewingProposal(null)}>
              Cancel
            </button>
            <button 
              className="btn-primary-sm" 
              onClick={async () => {
                try {
                  await API.patch(`/proposals/${viewingProposal.id}/`, { deadline: newDeadline });
                  alert("Deadline updated!");
                  setViewingProposal(null);
                  fetchData(); 
                } catch (err) {
                  alert("Failed to update: " + JSON.stringify(err.response?.data));
                }
              }}
            >
              Update Deadline
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}


          {activeTab === "messages" && (
  <div className="chat-app-container fade-in">
    {/* LEFT SIDEBAR: Dynamic Contract List */}
    <div className="chat-sidebar-main">
      <div className="chat-search-box">
        <input placeholder="Search chats..." />
      </div>
      <div className="chat-list-scroll">
        <p className="list-label">Active Contracts</p>
        
        {/* Map through contracts to show real people */}
        {contracts.map(c => {
  const chatPartner = profile.role === 'client' ? c.freelancer_username : c.client_username;
  return (
    <div 
      key={c.id} 
      // This 'active' class triggers the green border-left in the CSS
      className={`chat-user-item ${selectedContract?.id === c.id ? 'active' : ''}`}
      onClick={() => setSelectedContract(c)}
    >
      <div className="user-avatar">
        <img src={`https://ui-avatars.com/api/?name=${chatPartner}&background=1dbf73&color=fff`} alt="" />
      </div>
      <div className="user-info">
        <div className="user-top"><span className="user-name">{chatPartner}</span></div>
        <p className="last-msg">{c.project_title}</p>
      </div>
    </div>
  );
})}
      </div>
    </div>

    {/* RIGHT WINDOW: Dynamic Messages */}
    <div className="chat-window">
      {selectedContract ? (
        <>
          <div className="chat-window-header">
  <div className="header-left">
    <div className="active-user-avatar">
      <img src={`https://ui-avatars.com/api/?name=${profile.role === 'client' ? selectedContract.freelancer_username : selectedContract.client_username}&background=1dbf73&color=fff`} alt="User" />
      <span className="online-dot"></span>
    </div>
    <div className="active-user-info">
      <h4>{profile.role === 'client' ? selectedContract.freelancer_username : selectedContract.client_username}</h4>
      <span className="status-badge">Online</span>
    </div>
  </div>
  
  <div className="header-right">
    {/* Action buttons make the header look more functional */}
    <button className="icon-btn" title="View Project Details">📄</button>
    <button className="icon-btn" title="Call">📞</button>
    <button className="icon-btn" title="More Options">⋮</button>
  </div>
</div>

          <div className="chat-messages-display">
            {messages
              .filter(m => m.contract === selectedContract.id)
              .map((m, index) => {
                const isOutgoing = m.sender === profile.user_id || m.sender_username === profile.username;
                return (
                  <div key={index} className={`msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                    <div className="msg-bubble">
                      {m.content}
                      <span className="msg-time">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="chat-input-footer">
            <button className="attachment-btn">📎</button>
            <input 
              placeholder="Type your message..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-btn" onClick={handleSendMessage}>Send</button>
          </div>
        </>
      ) : (
        <div className="chat-empty-state">
          <p>Select a contract to start messaging</p>
        </div>
      )}
    </div>
  </div>
)}
        </div>

        {(isAddModalOpen || isModalOpen) && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Project Details</h3>
              <div className="modal-body">
                <input placeholder="Title" />
                <textarea placeholder="Description"></textarea>
                <div className="modal-row"><input placeholder="Budget" /><input placeholder="Duration" /></div>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => {setIsAddModalOpen(false); setIsModalOpen(false)}}>Cancel</button>
                <button className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} // <--- THIS WAS THE MISSING CLOSING BRACE

// THE CSS YOU PROVIDED
const premiumStyles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

  :root {
    --primary: #1dbf73;
    --primary-dark: #16a061;
    --bg: #f8fafc;
    --sidebar-bg: #ffffff;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text-main); overflow: hidden; }

  .app-shell { display: flex; height: 100vh; width: 100vw; }

  /* SIDEBAR */
  .sidebar { width: 280px; background: var(--sidebar-bg); border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 2rem 1.5rem; }
  .brand-box { display: flex; align-items: center; gap: 12px; margin-bottom: 3rem; }
  .logo-icon { background: var(--primary); color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
  .logo-text { font-size: 1.4rem; font-weight: 800; }
  .logo-text span { color: var(--primary); }

  .side-nav { flex-grow: 1; }
  .side-nav button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: none; background: transparent; color: var(--text-muted); font-weight: 600; cursor: pointer; border-radius: 12px; transition: 0.3s; margin-bottom: 6px; }
  .side-nav button:hover { background: #f1f5f9; color: var(--text-main); }
  .side-nav button.active { background: #f0fdf4; color: var(--primary); }
  .side-nav button .icon { font-size: 1.1rem; }

  .sidebar-footer { padding-top: 2rem; border-top: 1px solid #f1f5f9; }
  .logout-card { width: 100%; background: #fff1f2; color: #e11d48; border: none; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; transition: 0.2s; }
  .logout-card:hover { background: #ffe4e6; transform: translateX(5px); }

  /* MAIN CONTENT */
  .main-content { flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
  .main-header { padding: 1.5rem 3rem; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .header-left h1 { font-size: 1.6rem; font-weight: 800; }
  .breadcrumb { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
  .header-right { display: flex; align-items: center; gap: 2rem; }
  .user-profile-summary { display: flex; align-items: center; gap: 12px; padding: 6px 12px; background: #f8fafc; border-radius: 50px; }
  .user-profile-summary img { width: 36px; height: 36px; border-radius: 50%; }
  .user-name-text { display: flex; flex-direction: column; }
  .user-name-text .name { font-weight: 700; font-size: 0.9rem; }
  .user-name-text .role { font-size: 0.75rem; color: var(--text-muted); }

  .scroll-content { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; }

  /* DASHBOARD UI */
  .welcome-banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 24px; padding: 3rem; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; position: relative; overflow: hidden; }
  .welcome-banner::after { content: ''; position: absolute; width: 200px; height: 200px; background: var(--primary); filter: blur(100px); opacity: 0.2; right: -50px; bottom: -50px; }
  .banner-text h2 { font-size: 2.2rem; margin-bottom: 12px; }
  .banner-btn { background: var(--primary); color: white; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 20px; }
  .banner-img { font-size: 4rem; }

  .quick-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .q-card { background: white; padding: 2rem; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: var(--card-shadow); border: 1px solid #f1f5f9; }
  .q-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
  .q-val { font-size: 1.8rem; font-weight: 800; display: block; }
  .q-card p { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; }

  /* CLEAN TABLE STYLES */
.clean-table-container {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.count-pill {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.premium-table th {
  padding: 12px 15px;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid #f1f5f9;
  letter-spacing: 1px;
}

.table-row {
  border-bottom: 1px solid #f8fafc;
  transition: background 0.2s;
}

.table-row:hover {
  background: #fbfcfe;
}

.premium-table td {
  padding: 20px 15px;
  font-size: 0.9rem;
}

.p-title {
  font-weight: 700;
  color: var(--text-main);
}

.status-tag {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

/* REPORT MODAL STYLES */
.report-modal {
  width: 750px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 16px;
}

.report-header {
  padding: 1.5rem 2.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.report-body {
  padding: 3rem;
  background: white;
}

.report-section h4 {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.report-date { font-size: 0.85rem; color: #64748b; margin-bottom: 2rem; }

.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.info-group label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 4px;
}

.info-group p { font-weight: 600; color: #1e293b; }
.price-text { color: #1dbf73; font-size: 1.2rem; font-weight: 800 !important; }

.report-details {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px dashed #e2e8f0;
}

.details-content {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;
}

.btn-print {
  background: #1dbf73;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-close-report {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  margin-left: 1rem;
  cursor: pointer;
  color: #94a3b8;
}

/* IMPROVED REPORT ACTIONS */
.report-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Premium Print Button */
.btn-print-premium {
  background: linear-gradient(135deg, #1dbf73 0%, #19a463 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(29, 191, 115, 0.2);
}

.btn-print-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(29, 191, 115, 0.3);
  filter: brightness(1.05);
}

.btn-print-premium .icon {
  font-size: 1.1rem;
}

/* Circular Minimalist Close Button */
.btn-close-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.btn-close-circle:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
  transform: rotate(90deg); /* Modern rotating effect */
}

.close-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

/* Branding Fix */
.report-header .logo-text span:last-child {
  color: #1dbf73;
  font-weight: 800;
}

/* PRINT MEDIA QUERIES */
@media print {
  .sidebar, .main-header, .welcome-banner, .clean-table-container, .no-print {
    display: none !important;
  }
  .app-shell, .main-content, .scroll-content, body {
    overflow: visible !important;
    height: auto !important;
    background: white !important;
  }
  .modal-overlay {
    position: absolute !important;
    background: white !important;
    padding: 0 !important;
  }
  .report-modal {
    box-shadow: none !important;
    width: 100% !important;
    margin: 0 !important;
  }
}

/* Status Colors */
.status-tag.pending { background: #fffbeb; color: #b45309; }
.status-tag.accepted { background: #f0fdf4; color: #166534; }
.status-tag.rejected { background: #fef2f2; color: #991b1b; }

.table-btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.table-btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.empty-table {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-muted);
}

  /*Contract card */
  /* CONTRACTS PANEL STYLES */
.contracts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.contract-item-card {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--card-shadow);
  border: 1px solid #f1f5f9;
  transition: 0.3s;
}

.contract-item-card:hover {
  transform: translateX(5px);
  border-color: var(--primary);
}

.c-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.c-status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
}

.c-status-indicator.active {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.c-project-name {
  display: block;
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--text-main);
}

.c-party-name {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.c-details {
  display: flex;
  align-items: center;
  gap: 3rem;
}

/* Reusing your existing p-label and p-value from the proposal section */
.c-metric {
  display: flex;
  flex-direction: column;
}

  /* PROJECT CARDS */
  .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
  .premium-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: var(--card-shadow); border: 1px solid #f1f5f9; position: relative; transition: 0.3s; }
  .premium-card:hover { transform: translateY(-8px); border-color: var(--primary); }
  .type-pill { background: #f0fdf4; color: var(--primary); padding: 5px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  .card-top { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
  .premium-card h4 { font-size: 1.25rem; margin-bottom: 12px; line-height: 1.4; }
  .card-desc { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 2rem; }
  .card-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; border-top: 1px dashed #e2e8f0; }
  .card-price { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
  .btn-primary-sm { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
  .view-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;}
  .search-wrapper { position: relative; display: flex; align-items: center; width: 350px; }
  .search-icon {  position: absolute; left: 15px;  font-size: 0.9rem;  color: #64748b; }


  .search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 350px;
}

.premium-search-input {
  width: 100%;
  padding: 12px 15px 12px 45px; /* Leave space for the icon */
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.premium-search-input:focus {
  background: white;
  border-color: #1dbf73;
  box-shadow: 0 0 0 4px rgba(29, 191, 115, 0.1);
  outline: none;
  width: 400px; 
}


.empty-projects-placeholder {
  grid-column: 1 / -1; 
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 24px;
  border: 2px dashed #e2e8f0;
}
  .category-tag-sm {
  font-size: 0.7rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  text-transform: uppercase;
}

/* Proposals Section */
.proposal-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.2rem;
  transition: all 0.3s ease;
}
.p-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.project-info { display: flex; align-items: center; gap: 15px; }
.p-icon { width: 45px; height: 45px; background: #f0fdf4; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.p-status-badge { padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.p-status-badge.pending { background: #fef9c3; color: #854d0e; }
.p-status-badge.accepted { background: #dcfce7; color: #166534; }
.p-card-body { display: flex; gap: 3rem; padding: 1.2rem 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin-bottom: 1.2rem; }
.p-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.p-value { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.btn-primary-hire { background: #1dbf73; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }

.premium-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
}

.premium-modal-content {
  background: white;
  width: 500px;
  max-width: 90%;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.p-cover-box {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 12px;
  margin-top: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #334155;
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 15px;
}

.close-x {
  background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;
}

/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: white; width: 500px; padding: 2.5rem; border-radius: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.modal-body input, .modal-body textarea { width: 100%; background: #f1f5f9; border: 2px solid transparent; border-radius: 12px; padding: 14px; margin-bottom: 1rem; outline: none; transition: 0.2s; font-family: inherit; }
.modal-body input:focus { border-color: var(--primary); background: white; }
.modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.modal-actions { display: flex; gap: 12px; margin-top: 1rem; }
.btn-primary { flex: 1; background: var(--primary); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-cancel { flex: 1; background: #f1f5f9; color: var(--text-muted); border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; }

/* --- MESSAGES TAB --- */

/* --- ENHANCED SAAS MESSAGING TAB (Consolidated) --- */

.chat-app-container { 
  display: flex; 
  height: calc(100vh - 160px); 
  background: #ffffff; 
  border-radius: 20px; 
  overflow: hidden; 
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04); 
  border: 1px solid #f1f5f9;
  margin: 10px;
}

/* --- SIDEBAR REFINEMENT --- */
.chat-sidebar-main { 
  width: 320px; 
  border-right: 1px solid #f1f5f9; 
  display: flex; 
  flex-direction: column; 
  background: #ffffff; 
}

.chat-search-box { padding: 20px; }
.chat-search-box input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.chat-user-item {
  display: flex;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
  border-left: 4px solid transparent;
}

.chat-user-item.active {
  background: #f0fdf4;
  border-left-color: #1dbf73;
}

/* --- NEW ENHANCED HEADER --- */
.chat-window-header {
  padding: 15px 25px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.header-left { display: flex; align-items: center; gap: 15px; }

.active-user-avatar { position: relative; width: 45px; height: 45px; }
.active-user-avatar img {
  width: 100%; height: 100%;
  border-radius: 12px;
  object-fit: cover;
}

.online-dot {
  position: absolute; bottom: -2px; right: -2px;
  width: 12px; height: 12px;
  background: #1dbf73;
  border: 2px solid white;
  border-radius: 50%;
}

.active-user-info h4 { margin: 0; font-size: 1.05rem; color: #1e293b; font-weight: 600; }
.status-badge { font-size: 0.75rem; color: #1dbf73; font-weight: 500; display: flex; align-items: center; gap: 4px; }

.header-right { display: flex; gap: 8px; }
.icon-btn {
  background: #f8fafc; border: 1px solid #e2e8f0;
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}

/* --- CHAT WINDOW & BUBBLES --- */
.chat-window { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  background-color: #fcfcfc; 
}

.chat-messages-display { 
  flex: 1; padding: 25px; 
  overflow-y: auto; 
  display: flex; flex-direction: column; gap: 12px; 
}

.msg-row { display: flex; width: 100%; animation: slideIn 0.3s ease-out; }
.incoming { justify-content: flex-start; }
.outgoing { justify-content: flex-end; }

.msg-bubble { 
  max-width: 70%; 
  /* Increased bottom padding to ensure time doesn't overlap text */
  padding: 12px 16px 28px 16px; 
  font-size: 0.95rem; 
  position: relative; 
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  /* Prevents long URLs or words from overflowing the bubble */
  word-wrap: break-word;
  word-break: break-word;
  display: flex;
  flex-direction: column;
}

.outgoing .msg-bubble { 
  background: #1dbf73; 
  color: #ffffff; 
  border-radius: 18px 18px 4px 18px; 
  align-self: flex-end;
}

.incoming .msg-bubble { 
  background: #f1f5f9; 
  color: #334155; 
  border-radius: 18px 18px 18px 4px;
  align-self: flex-start;
}

.msg-time { 
  position: absolute; 
  bottom: 6px; 
  right: 12px; 
  font-size: 0.7rem; 
  font-weight: 500;
  /* Ensures time stays on one line */
  white-space: nowrap; 
}

.outgoing .msg-time { 
  color: rgba(255, 255, 255, 0.85); 
}

.incoming .msg-time { 
  color: #94a3b8; 
}

/* --- FLOATING PILL FOOTER --- */
.chat-input-footer { 
  margin: 15px 25px 25px 25px;
  padding: 8px 16px;
  background: #ffffff;
  border-radius: 50px; 
  display: flex; gap: 12px; align-items: center; 
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.chat-input-footer input { flex: 1; border: none; background: transparent; padding: 10px; outline: none; }
.send-btn { background: #1dbf73; color: #ffffff; border: none; padding: 10px 22px; border-radius: 25px; font-weight: 600; cursor: pointer; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-screen { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: white; }
.loader-bar { width: 140px; height: 4px; background: #f1f5f9; position: relative; overflow: hidden; border-radius: 10px; margin-top: 15px; }
.loader-bar::after { content: ''; position: absolute; width: 40%; height: 100%; background: var(--primary); animation: loading 1.5s infinite ease-in-out; }
@keyframes loading { from { left: -40%; } to { left: 100%; } }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.user-profile-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

/* Change background color when hovering over the profile area */
.user-profile-summary:hover {
  background: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-profile-summary img {
  width: 38px;
  height: 38px;
  border-radius: 10px; /* Matching your SaaS card style */
  border: 2px solid #1dbf73;
}

`;