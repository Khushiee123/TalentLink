import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// 1. Import the CSS
import "./HomeStyles.css"; 

// 2. Import the Tab Components
import ProfileTab from "./Profile_Tab";
import DashboardTab from "./tabs/DashboardTab";
import ProjectsTab from "./tabs/ProjectsTab";
import ProposalsTab from "./tabs/ProposalsTab";
import MessagesTab from "./tabs/MessagesTab";

export default function Home() {
  // --- GLOBAL STATE ---
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // NEW: Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const navigate = useNavigate();

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      const [profileRes, projectRes, propRes, contRes] = await Promise.all([
        API.get("/profile/"), 
        API.get("/projects/"),
        API.get("/proposals/"), 
        API.get("/contracts/")
      ]);
      setProfile(profileRes.data);
      setProjects(projectRes.data);
      setProposals(propRes.data);
      setContracts(contRes.data);
    } catch (err) { 
      if (err.response?.status === 401) navigate("/"); 
    }
  }, [navigate]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // --- RENDER LOGIC ---
  if (!profile) return (
    <div className="loading-screen">
      <div className="loader-bar"></div>
    </div>
  );

  const isClient = profile.role?.toLowerCase() === "client";

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "side-collapsed" : ""}`}>
      {/* --- SIDEBAR --- */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        {/* Move the button outside brand-box for persistent visibility */}
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>

        <div className="brand-box">
          <div className="logo-icon">TL</div>
          {!isSidebarCollapsed && (
            <div className="logo-text">Talent<span>Link</span></div>
          )}
        </div>
        
        <nav className="side-nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'projects', label: 'Projects', icon: '💼' },
            { id: 'proposals', label: 'Proposals', icon: '📩' },
            { id: 'messages', label: 'Messages', icon: '💬' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''} 
              onClick={() => setActiveTab(tab.id)}
              title={isSidebarCollapsed ? tab.label : ""} 
            >
              <span className="icon">{tab.icon}</span> 
              {!isSidebarCollapsed && <span className="label-text">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-card" onClick={() => {localStorage.clear(); navigate("/");}}>
            <span className="icon">🚪</span>
            {!isSidebarCollapsed && <span>Logout →</span>}
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
            <div 
              className="user-profile-summary" 
              onClick={() => setActiveTab('profile')} 
              style={{ cursor: 'pointer' }}
            >
              <img src={`https://ui-avatars.com/api/?name=${profile.username}&background=1dbf73&color=fff`} alt="Avatar" />
              <div className="user-name-text">
                <span className="name">{profile.username}</span>
                <span className="role">{profile.role}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="scroll-content">
          {/* TAB ROUTING */}
          {activeTab === 'profile' && (
            <ProfileTab 
              profile={profile} 
              contracts={contracts} 
              proposals={proposals} 
              onRefresh={fetchData} 
            />
          )}

          {activeTab === "dashboard" && (
            <DashboardTab 
              proposals={proposals} 
              isClient={isClient} 
              fetchData={fetchData} 
            />
          )}

          {activeTab === "projects" && (
            <ProjectsTab 
              projects={projects} 
              proposals={proposals} 
              isClient={isClient} 
              onRefresh={fetchData} 
            />
          )}

          {activeTab === "proposals" && (
            <ProposalsTab 
              proposals={proposals} 
              isClient={isClient} 
              onRefresh={fetchData} 
            />
          )}

          {activeTab === "messages" && (
            <MessagesTab 
              contracts={contracts} 
              profile={profile} 
            />
          )}
        </div>
      </div>
    </div>
  );
}