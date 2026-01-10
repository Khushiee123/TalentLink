import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";

const MessagesTab = ({ contracts, profile }) => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Logic
  const fetchMessages = async () => {
    if (!selectedContract) return;
    try {
      const response = await API.get(`/messages/?contract=${selectedContract.id}`);
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // 5-Second Polling Logic
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      if (selectedContract) fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContract]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedContract) return;
    try {
      const response = await API.post("/messages/", {
        contract: selectedContract.id,
        content: chatInput,
      });
      setMessages([...messages, response.data]);
      setChatInput("");
    } catch (err) {
      console.error("Message failed to send:", err);
    }
  };

  return (
    <div className="chat-app-container fade-in">
      {/* LEFT SIDEBAR: ACTIVE CONTRACTS */}
      <div className="chat-sidebar-main">
        <div className="chat-search-box">
          <input type="text" placeholder="Search conversations..." />
        </div>
        <div className="chat-list">
          {contracts.map((c) => (
            <div
              key={c.id}
              className={`chat-user-item ${selectedContract?.id === c.id ? "active" : ""}`}
              onClick={() => setSelectedContract(c)}
            >
              <div className="active-user-avatar">
                 <img src={`https://ui-avatars.com/api/?name=${profile.role === 'client' ? c.freelancer_username : c.client_username}&background=random`} alt="user" />
                 <div className="online-dot"></div>
              </div>
              <div style={{ marginLeft: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', margin: 0 }}>
                    {profile.role === 'client' ? c.freelancer_username : c.client_username}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{c.project_title}</p>
              </div>
            </div>
          ))}
          {contracts.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No active contracts found.</p>}
        </div>
      </div>

      {/* RIGHT SIDE: CHAT WINDOW */}
      <div className="chat-window">
        {selectedContract ? (
          <>
            <header className="chat-window-header">
              <div className="header-left">
                <div className="active-user-info">
                  <h4>{profile.role === 'client' ? selectedContract.freelancer_username : selectedContract.client_username}</h4>
                  <div className="status-badge">Online</div>
                </div>
              </div>
            </header>

            <div className="chat-messages-display">
  {messages
    .filter(m => m.contract === selectedContract.id)
    .map((m, index) => {
      // FIX: Ensure both IDs are converted to Strings for a reliable comparison
      // Also check by username as a fallback if the ID field is named differently
      const isOutgoing = 
        String(m.sender) === String(profile.user_id) || 
        m.sender_username === profile.username;

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
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;