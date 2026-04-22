// import React, { useState } from 'react'
// import './sidebar.css'
// import { assets } from '../../assets/assets.js'
// const Sidebar = () => {

//     const [extended, setExtended] = useState(false)



//   return (
//     <div className='sidebar'>
//         <div className="top">
//             <img onClick={()=>setExtended(prev=>!prev)} className='menu' src={assets.menu_icon} alt="" />
//             <div className="new-chat">
//                 <img src={assets.plus_icon} alt="" />
//                {extended? <p>New Chat </p>: null}
//             </div>
//             {extended
//             ?<div className="recent">
//                 <p className="recent-title">Recent</p>
//                 <div className="recent-entry">
//                     <img src={assets.message_icon} alt="" />
//                     <p>what is react... </p>
//                 </div>
//             </div>
//             :null
//             }
//         </div>

//         <div className="bottom">
//             <div className="bottom-item recent-entry">
//                 <img src={assets.question_icon} alt="" />
//                 {extended? <p> Help</p>: null}
//             </div>
//             <div className="bottom-item recent-entry">
//                 <img src={assets.history_icon} alt="" />
//                 {extended? <p> Activity</p>: null}
//             </div>
//             <div className="bottom-item recent-entry">
            
//                 <img src={assets.setting_icon} alt="" />
//                 {extended? <p> Settings</p>: null}
//             </div>
//         </div>
//     </div>
//   )
// }

// export default Sidebar

import React, { useState, useContext } from 'react'
import './sidebar.css'
import { assets } from '../../assets/assets.js'
import { context } from '../../contex/context.jsx'

const Sidebar = () => {
  const [extended, setExtended] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const {
    chatHistory,
    activeChatId,
    newChat,
    loadChat,
    deleteChat,
    clearHistory,
  } = useContext(context)

  const handleNewChat = () => {
    newChat()
    setActiveItem(null)
  }

  const handleLoadChat = (id) => {
    loadChat(id)
    setActiveItem(id)
  }

  const handleClearHistory = () => {
    if (confirmClear) {
      clearHistory()
      setConfirmClear(false)
      setActiveItem(null)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  // Format timestamp to relative time
  const formatTime = (ts) => {
    if (!ts) return ''
    const diff = Date.now() - ts
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins  < 1)   return 'Just now'
    if (mins  < 60)  return `${mins}m ago`
    if (hours < 24)  return `${hours}h ago`
    if (days  < 7)   return `${days}d ago`
    return new Date(ts).toLocaleDateString()
  }

  return (
    <div className={`sidebar ${extended ? 'extended' : ''}`}>

      {/* ── Top section ───────────────────────────────────────────────────── */}
      <div className="top">

        {/* Menu toggle */}
        <button
          className="icon-btn menu-btn"
          onClick={() => setExtended(prev => !prev)}
          title={extended ? 'Collapse' : 'Expand'}
        >
          <img src={assets.menu_icon} alt="Menu" />
        </button>

        {/* New chat */}
        <button className="new-chat-btn" onClick={handleNewChat} title="New chat">
          <img src={assets.plus_icon} alt="New chat" />
          {extended && <span>New chat</span>}
        </button>

        {/* Recent chats */}
        {extended && (
          <div className="recent">
            <div className="recent-header">
              <p className="recent-title">Recent</p>
              {chatHistory.length > 0 && (
                <button
                  className={`clear-btn ${confirmClear ? 'confirm' : ''}`}
                  onClick={handleClearHistory}
                  title={confirmClear ? 'Click again to confirm' : 'Clear all history'}
                >
                  {confirmClear ? 'Sure?' : 'Clear'}
                </button>
              )}
            </div>

            <div className="recent-list">
              {chatHistory.length === 0 ? (
                <p className="empty-msg">No recent chats yet</p>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`recent-entry ${chat.id === (activeItem ?? activeChatId) ? 'active' : ''}`}
                    onClick={() => handleLoadChat(chat.id)}
                    title={chat.title}
                  >
                    <img src={assets.message_icon} alt="" />
                    <div className="entry-meta">
                      <p className="entry-title">
                        {chat.title.length > 26 ? chat.title.slice(0, 26) + '…' : chat.title}
                      </p>
                      <p className="entry-time">{formatTime(chat.createdAt)}</p>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom section ────────────────────────────────────────────────── */}
      <div className="bottom">
        {[
          { icon: assets.question_icon, label: 'Help',     key: 'help' },
          { icon: assets.history_icon,  label: 'Activity', key: 'activity' },
          { icon: assets.setting_icon,  label: 'Settings', key: 'settings' },
        ].map(({ icon, label, key }) => (
          <button
            key={key}
            className={`bottom-item ${activeItem === key ? 'active' : ''}`}
            onClick={() => setActiveItem(prev => prev === key ? null : key)}
            title={label}
          >
            <img src={icon} alt={label} />
            {extended && <span>{label}</span>}
          </button>
        ))}
      </div>

    </div>
  )
}

export default Sidebar