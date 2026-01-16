import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";

const MessagesTab = ({ contracts, profile }) => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedContract) return;
    try {
      const response = await API.get(`/messages/?contract=${selectedContract.id}`);
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      if (selectedContract) fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContract]);

  const handleSendMessage = async () => {
    // UPDATED LOGIC: Allow send if there is text OR a file selected
    if ((!chatInput.trim() && !selectedFile) || !selectedContract) return;

    try {
      const formData = new FormData();
      formData.append("contract", selectedContract.id);
      
      // Only append content if it's not empty
      if (chatInput.trim()) {
        formData.append("content", chatInput);
      }
      
      // Append file if it exists
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await API.post("/messages/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages([...messages, response.data]);
      setChatInput("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Message failed to send:", err);
    }
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderAttachment = (fileUrl) => {
    if (!fileUrl) return null;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
    
    return (
      <div className="attachment-bubble-content">
        {isImage ? (
          <div className="image-container" onClick={() => window.open(fileUrl, '_blank')}>
            <img src={fileUrl} alt="Attachment" className="chat-img-clickable" />
            <div className="image-overlay">Click to expand</div>
          </div>
        ) : (
          <div className="doc-container" onClick={() => window.open(fileUrl, '_blank')}>
            <div className="doc-icon-wrapper">📄</div>
            <div className="doc-info">
              <span className="doc-name">View Document</span>
              <span className="doc-action">Click to open</span>
            </div>
            <div className="doc-download-btn">⬇️</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-app-container fade-in">
      <style>{whatsappStyles}</style>

      <div className="chat-sidebar-main">
        <div className="chat-search-box">
          <input type="text" placeholder="Search conversations..." />
        </div>
        <div className="chat-list scrollable-area">
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
        </div>
      </div>

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

            <div className="chat-messages-display scrollable-area">
              {messages
                .filter(m => m.contract === selectedContract.id)
                .map((m, index, array) => {
                  const isOutgoing = String(m.sender) === String(profile.user_id) || m.sender_username === profile.username;
                  const currentDate = formatMessageDate(m.timestamp);
                  const prevDate = index > 0 ? formatMessageDate(array[index - 1].timestamp) : null;
                  const showDate = currentDate !== prevDate;

                  return (
                    <React.Fragment key={m.id || index}>
                      {showDate && <div className="chat-date-separator"><span>{currentDate}</span></div>}
                      <div className={`msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                        <div className="msg-bubble">
                          {renderAttachment(m.file)}
                          {m.content && <p className="msg-text">{m.content}</p>}
                          <span className="msg-time">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-footer">
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={(e) => setSelectedFile(e.target.files[0])} 
              />
              
              <button className="attachment-btn" onClick={() => fileInputRef.current.click()}>📎</button>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {selectedFile && (
                  <div className="whatsapp-file-preview">
                    <span className="file-preview-name">📎 {selectedFile.name}</span>
                    <button className="file-remove-x" onClick={() => setSelectedFile(null)}>&times;</button>
                  </div>
                )}
                
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              <button className="send-btn" onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

const whatsappStyles = `
  .scrollable-area { overflow-y: auto; height: 100%; scroll-behavior: smooth; }
  .chat-date-separator { display: flex; justify-content: center; margin: 25px 0; position: sticky; top: 5px; z-index: 5; }
  .chat-date-separator span { background: rgba(225, 245, 254, 0.9); color: #546e7a; padding: 6px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

  .attachment-bubble-content { margin-bottom: 8px; cursor: pointer; border-radius: 8px; overflow: hidden; }
  .image-container { position: relative; border-radius: 8px; overflow: hidden; background: #f1f5f9; }
  .chat-img-clickable { width: 100%; max-height: 250px; display: block; object-fit: cover; }
  .image-overlay { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.4); color: white; font-size: 0.7rem; text-align: center; padding: 4px 0; opacity: 0; transition: 0.3s; }
  .image-container:hover .image-overlay { opacity: 1; }

  .doc-container { display: flex; align-items: center; background: rgba(0, 0, 0, 0.05); padding: 10px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); gap: 12px; }
  .doc-info { display: flex; flex-direction: column; flex: 1; }
  .doc-name { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
  .doc-action { font-size: 0.7rem; color: #64748b; }

  .whatsapp-file-preview { position: absolute; bottom: 55px; left: 0; background: #ffffff; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 -5px 15px rgba(0,0,0,0.05); z-index: 10; }
  .file-remove-x { background: #ff4d4f; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-weight: bold; }

  .msg-text { margin: 0; font-size: 0.95rem; }

  .doc-container { 
    display: flex; 
    align-items: center; 
    background: rgba(255, 255, 255, 0.2); /* Semi-transparent white to blend with bubble */
    padding: 10px; 
    border-radius: 8px; 
    border: 1px solid rgba(255, 255, 255, 0.3); /* Subtle border */
    gap: 12px; 
    cursor: pointer;
    transition: background 0.2s;
}

.doc-container:hover { 
    background: rgba(255, 255, 255, 0.3); /* Slightly brighter on hover */
}

.doc-name { 
    font-size: 0.85rem; 
    font-weight: 600; 
    color: #ffffff; /* White text to match your outgoing bubble style */
}

.doc-action { 
    font-size: 0.7rem; 
    color: rgba(255, 255, 255, 0.8); /* Faded white for secondary text */
}



`;

export default MessagesTab;