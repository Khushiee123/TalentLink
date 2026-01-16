import React, { useEffect, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import { Bell, MessageSquare, FileText, CheckCircle, Briefcase, Star, Sun, Moon} from 'lucide-react'; 

import "./HomeStyles.css"; 



import ProfileTab from "./Profile_Tab";

import DashboardTab from "./tabs/DashboardTab";

import ProjectsTab from "./tabs/ProjectsTab";

import ProposalsTab from "./tabs/ProposalsTab";

import MessagesTab from "./tabs/MessagesTab";



// --- 1. NotificationBell Component ---

const NotificationBell = ({ onNavigateTab }) => {

  const [notifications, setNotifications] = useState([]);

  const [isOpen, setIsOpen] = useState(false);



  const fetchNotifications = useCallback(async () => {

    try {

      const res = await API.get('/notifications/');

      setNotifications(res.data);

    } catch (err) {

      console.error("Notification fetch error:", err);

    }

  }, []);



  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);

  }, [fetchNotifications]);



  const unreadCount = notifications.filter(n => !n.is_read).length;



  const getNotificationIcon = (type) => {

    const t = type?.toUpperCase();

    if (t === 'MESSAGE') return <MessageSquare size={16} className="nt-icon msg" />;

    if (t === 'PROPOSAL') return <FileText size={16} className="nt-icon prop" />;

    if (t === 'SYSTEM' || t === 'CONTRACT') return <CheckCircle size={16} className="nt-icon cont" />;

    return <Bell size={16} className="nt-icon def" />;

  };



  const markAllRead = async () => {

    try {

      await API.post('/notifications/mark_all_read/'); 

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));

    } catch (err) {

      console.error("Failed to mark notifications as read", err);

    }

  };



  const handleNotificationClick = (n) => {

    const type = n.n_type?.toLowerCase();

    if (type === 'message') onNavigateTab('messages');

    else if (type === 'proposal') onNavigateTab('proposals');

    else if (type === 'system') onNavigateTab('dashboard');

    setIsOpen(false);

  };



  return (

    <div className="notification-container" style={{ position: 'relative', marginRight: '15px' }}>

      <button onClick={() => setIsOpen(!isOpen)} className="bell-button" title="Notifications">

        <Bell size={24} />

        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

      </button>



      {isOpen && (

        <div className="notification-dropdown animate-in">

          <div className="dropdown-header">

             <h3>Notifications</h3>

             {unreadCount > 0 && <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>}

          </div>

          <div className="notification-list">

            {notifications.length === 0 ? (

              <div className="empty-state"><p>No notifications yet!</p></div>

            ) : (

              notifications.map(n => (

                <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`} onClick={() => handleNotificationClick(n)}>

                  <div className="nt-content-row">

                    {getNotificationIcon(n.n_type)} 

                    <div className="nt-text-box">

                      <p>{n.message}</p>

                      <small>{new Date(n.created_at).toLocaleString()}</small>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      )}

    </div>

  );

};



// --- 2. Main Home Component ---

export default function Home() {

  const [profile, setProfile] = useState(null);

  const [projects, setProjects] = useState([]);

  const [proposals, setProposals] = useState([]);

  const [contracts, setContracts] = useState([]);

  const [reviews, setReviews] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");



  // Effect to apply theme class to the body

  useEffect(() => {

    document.body.className = theme + "-theme";

    localStorage.setItem("theme", theme);

  }, [theme]);



  const toggleTheme = () => {

    setTheme(prev => prev === "light" ? "dark" : "light");

  };



  // CHATBOT STATES - Correctly placed inside Home

  const [isChatOpen, setIsChatOpen] = useState(false);

  const [showHelpTooltip, setShowHelpTooltip] = useState(true);

  

  const navigate = useNavigate();



  const fetchData = useCallback(async () => {

    try {

      const [profileRes, projectRes, propRes, contRes, reviewRes] = await Promise.all([

        API.get("/profile/"), 

        API.get("/projects/"),

        API.get("/proposals/"), 

        API.get("/contracts/"),

        API.get("/reviews/") 

      ]);

      setProfile(profileRes.data);

      setProjects(projectRes.data);

      setProposals(propRes.data);

      setContracts(contRes.data);

      setReviews(reviewRes.data);

    } catch (err) { 

      if (err.response?.status === 401) navigate("/"); 

    }

  }, [navigate]);



  useEffect(() => { 

    fetchData(); 

  }, [fetchData]);



  // Hide the "Need help?" message after 8 seconds

  useEffect(() => {

    const timer = setTimeout(() => setShowHelpTooltip(false), 8000);

    return () => clearTimeout(timer);

  }, []);



  if (!profile) return (

    <div className="loading-screen">

      <div className="loader-bar"></div>

    </div>

  );



  const isClient = profile.role?.toLowerCase() === "client";



  const StarRatingStatic = ({ rating }) => (

    <div style={{ color: '#ffbf00', display: 'flex', gap: '2px' }}>

      {[...Array(5)].map((_, i) => (

        <span key={i}>{i < Math.round(rating) ? "★" : "☆"}</span>

      ))}

    </div>

  );



  return (

    <div className={`app-shell ${isSidebarCollapsed ? "side-collapsed" : ""}`}>

      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>

        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>

          {isSidebarCollapsed ? "→" : "←"}

        </button>



        <div className="brand-box">

          <div className="logo-icon">TL</div>

          {!isSidebarCollapsed && <div className="logo-text">Talent<span>Link</span></div>}

        </div>

        

        <nav className="side-nav">

          {[

            { id: 'dashboard', label: 'Dashboard', icon: <Briefcase size={18}/> },

            { id: 'projects', label: 'Projects', icon: <Briefcase size={18}/> },

            { id: 'proposals', label: 'Proposals', icon: <FileText size={18}/> },

            { id: 'messages', label: 'Messages', icon: <MessageSquare size={18}/> },

            { id: 'reviews', label: 'Reviews', icon: <Star size={18}/> }

          ].map(tab => (

            <button 

              key={tab.id}

              className={activeTab === tab.id ? 'active' : ''} 

              onClick={() => setActiveTab(tab.id)}

            >

              <span className="icon">{tab.icon}</span> 

              {!isSidebarCollapsed && <span className="label-text">{tab.label}</span>}

            </button>

          ))}

        </nav>



        <div className="sidebar-footer">

          <button className="logout-card" onClick={() => {localStorage.clear(); navigate("/");}}>

            <span className="icon">🚪</span>

            {!isSidebarCollapsed && <span>Logout</span>}

          </button>

        </div>

      </aside>



      <div className="main-content">

        <header className="main-header">

          <div className="header-left">

            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>

            <p className="breadcrumb">TalentLink / {activeTab}</p>

          </div>

          

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>



            {/* NEW: Theme Toggle Button */}

            <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Mode">

              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}

            </button>



            <NotificationBell onNavigateTab={setActiveTab} />

            <div className="user-profile-summary" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>

              <img src={`https://ui-avatars.com/api/?name=${profile.username}&background=1dbf73&color=fff`} alt="Avatar" />

              <div className="user-name-text">

                <span className="name">{profile.username}</span>

                <span className="role">{profile.role}</span>

              </div>

            </div>

          </div>

        </header>



        <div className="scroll-content">

          {activeTab === 'profile' && <ProfileTab profile={profile} contracts={contracts} proposals={proposals} onRefresh={fetchData} />}

          {activeTab === "dashboard" && <DashboardTab proposals={proposals} isClient={isClient} onRefresh={fetchData} />}

          {activeTab === "projects" && <ProjectsTab projects={projects} proposals={proposals} isClient={isClient} onRefresh={fetchData} />}

          {activeTab === "proposals" && <ProposalsTab proposals={proposals} isClient={isClient} onRefresh={fetchData} />}

          {activeTab === "messages" && <MessagesTab contracts={contracts} profile={profile} />}

          

          {activeTab === "reviews" && (

            <div className="fade-in" style={{ padding: '20px' }}>

              <div className="welcome-banner" style={{ marginBottom: '25px' }}>

                <div className="banner-text">

                  <h2>Verified Feedback</h2>

                  <p><h3>Your Reviews & Ratings</h3></p>

                  <p><h4>Comprehensive history of feedback given and received.</h4></p>

                </div>

                <div className="banner-img">⭐</div>

              </div>



              <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>

                {reviews.length > 0 ? reviews.map(rev => (

                  <div key={rev.id} className="clean-table-container" style={{ padding: '20px', borderRadius: '12px' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>

                      <strong style={{ color: '#2d3748' }}>{rev.project_title || "Project Review"}</strong>

                      <StarRatingStatic rating={rev.rating} />

                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#4a5568', fontStyle: 'italic', marginBottom: '15px' }}>

                      "{rev.comment || "No comment provided."}"

                    </p>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0' }}>

                      <span>By: {rev.reviewer_username}</span>

                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>

                    </div>

                  </div>

                )) : (

                  <div className="empty-state"><p>No reviews found.</p></div>

                )}

              </div>

            </div>

          )}

        </div>

      </div>


    </div>

  );

}