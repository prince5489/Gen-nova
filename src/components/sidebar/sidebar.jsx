import React, { useState, useContext } from 'react'
import './sidebar.css'
import { assets } from '../../assets/assets.js'
import { context } from '../../contex/context.jsx'

const Sidebar = () => {
  const [extended, setExtended] = useState(false)
  const {
    chatHistory,
    activeChatId,
    newChat,
    loadChat,
    deleteChat,
  } = useContext(context)

  const formatTime = (ts) => {
    if (!ts) return ''
    const diff = Date.now() - ts
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <aside className={`sidebar-elite ${extended ? 'extended' : 'collapsed'}`}>
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="menu-wrapper" onClick={() => setExtended(prev => !prev)}>
          <img src={assets.menu_icon} alt="Toggle" className="menu-icon" />
        </div>
        {extended && <h1 className="sidebar-logo elite-text-accent">Gen-Nova</h1>}
      </div>

      {/* ── Primary Actions ── */}
      <div className="sidebar-actions">
        <button className="new-session-btn elite-action-btn" onClick={newChat}>
          <div className="btn-overlay"></div>
          <img src={assets.plus_icon} alt="+" />
          {extended && <span>New Session</span>}
        </button>
      </div>

      {/* ── Recent History ── */}
      <div className="sidebar-scroll-area">
        {extended && <p className="section-label">Recents</p>}
        
        <div className="history-list">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="item-icon-box">
                <img src={assets.message_icon} alt="" />
              </div>
              
              {extended && (
                <>
                  <div className="item-content">
                    <p className="item-title">{chat.title}</p>
                    <span className="item-meta">{formatTime(chat.createdAt)}</span>
                  </div>
                  <button 
                    className="item-delete" 
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Tools ── */}
      <div className="sidebar-footer">
        {[
          { icon: assets.question_icon, label: 'Help' },
          { icon: assets.setting_icon, label: 'Settings' },
        ].map((item, i) => (
          <div key={i} className="footer-item" title={item.label}>
            <img src={item.icon} alt={item.label} />
            {extended && <span>{item.label}</span>}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar