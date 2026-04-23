import React, { useContext, useRef, useEffect } from 'react'
import './main.css'
import { assets } from '../../assets/assets.js'
import { context } from '../../contex/context.jsx';

const Main = () => {
  const {
    input, setInput,
    onSent,
    loading, error,
    currentMessages,
    suggestions,
    newChat,
    stopGeneration,
  } = useContext(context);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasMessages = currentMessages.length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, loading]);

  const handleSend = () => {
    if (input.trim() && !loading) {
      onSent();
      if (inputRef.current) inputRef.current.style.height = 'auto';
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className='main-workspace-elite'>
      {/* ── Top Navigation ── */}
      <header className="main-header-elite">
        <div className="header-left">
          <p className="breadcrumb">Workspace / Gen-Nova Pro</p>
        </div>
        <div className="header-right">
          <button className="header-icon-btn-elite" onClick={newChat} title="New Chat">
            <img src={assets.plus_icon} alt="+" />
          </button>
          <div className="user-pill-elite">
            <span>Dev_User</span>
            <img src={assets.user_icon} alt="User" />
          </div>
        </div>
      </header>

      <div className="content-area-elite">
        {!hasMessages ? (
          /* ── Welcome Screen ── */
          <div className="welcome-view">
            <div className="hero-section">
              <h1 className="hero-title">
                Define the next breakthrough.
              </h1>
              <p className="hero-subtitle">Premium AI Assistant for Elite Workflows and Innovation.</p>
            </div>

            <div className="suggestion-grid">
              {suggestions.map((s, i) => (
                <div key={i} className="elite-glass-card suggestion-card" onClick={() => { setInput(s.prompt); onSent(s.prompt); }}>
                  <div className="card-top">
                    <span className="card-icon">{s.icon}</span>
                  </div>
                  <p>{s.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Active Chat Stream ── */
          <div className="chat-stream">
            {currentMessages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-box">
                  {msg.role === 'model' && (
                    <div className="bot-avatar-wrapper">
                      <img src={assets.gemini_icon} alt="AI" className="elite-border-avatar" />
                    </div>
                  )}
                  <div className="text-bubble">
                    <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message-row model">
                <div className="message-box">
                  <div className="bot-avatar-wrapper">
                    <img src={assets.gemini_icon} alt="AI" className="elite-border-avatar spinning-elite" />
                  </div>
                  <div className="loading-shimmer-elite">
                    <div className="shimmer-line"></div>
                    <div className="shimmer-line short"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ── Fixed Bottom Input ── */}
      <footer className="input-section">
        <div className="input-outer-container">
          <div className="elite-input-panel">
            <div className="input-tools">
              <button className="tool-btn"><img src={assets.gallery_icon} alt="" /></button>
              <button className="tool-btn"><img src={assets.mic_icon} alt="" /></button>
            </div>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Message Gen-Nova Elite..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={handleKey}
            />
            <button 
              className={`elite-send-btn ${input.trim() ? 'ready' : ''}`} 
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? <div className="stop-icon" onClick={stopGeneration} /> : <img src={assets.send_icon} alt="Send" />}
            </button>
          </div>
          <p className="footer-disclaimer">Gen-Nova Pro is designed for high-stakes verification. Validate key information.</p>
        </div>
      </footer>
    </main>
  );
};

export default Main;