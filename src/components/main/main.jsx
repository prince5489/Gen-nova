// import React, { useContext, useState } from 'react'
// import './main.css'
// import { assets } from '../../assets/assets.js'
// import { context } from '../../contex/context.jsx';

// const Main = () => {
//   const { onSent, response } = useContext(context);
//   const [input, setInput] = useState("");

//   const handleSend = async () => {
//     if (input.trim()) {
//       await onSent(input);
//       setInput("");
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSend();
//     }
//   };

//   return (
//     <div className='main'>
//       <div className="nav">
//         <p>Gemini</p>
//         <img src={assets.user_icon} alt="" />
//       </div>
//       <div className="main-container">
//         {!response ? (
//           <>
//             <div className="greet">
//               <p><span>Hello, Dev.</span></p>
//               <p>How can I help you today?</p>
//             </div>
//             <div className="cards">
//               <div className="card">
//                 <p>Suggest beautiful places to see on an upcoming road trip</p>
//                 <img src={assets.compass_icon} alt="" />
//               </div>
//               <div className="card">
//                 <p>Briefly summarize this concept: urban planning</p>
//                 <img src={assets.bulb_icon} alt="" />
//               </div>
//               <div className="card">
//                 <p>Brainstorm team bonding activities for our work retreat</p>
//                 <img src={assets.message_icon} alt="" />
//               </div>
//               <div className="card">
//                 <p>Improve the readability of the following code</p>
//                 <img src={assets.code_icon} alt="" />
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="result">
//             <div className="result-title">
//               <img src={assets.user_icon} alt="" />
//               <p>You</p>
//             </div>
//             <div className="result-data">
//               <p>{input || "Your prompt here"}</p>
//             </div>
//             <div className="result-title">
//               <img src={assets.gemini_icon} alt="" />
//               <p>Gemini</p>
//             </div>
//             <div className="result-data">
//               <p dangerouslySetInnerHTML={{__html: response}}></p>
//             </div>
//           </div>
//         )}
//         <div className="main-bottom">
//           <div className="search-box">
//             <input
//               type="text"
//               placeholder='Enter a prompt here'
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//             />
//             <div>
//               <img src={assets.gallery_icon} alt="" />
//               <img src={assets.mic_icon} alt="" />
//               <img src={assets.send_icon} alt="" onClick={handleSend} />
//             </div>
//           </div>
//           <p className="bottom-info">Gemini can make mistakes. Consider checking important information.</p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Main

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
    recentPrompts,
    newChat,
    regenerate,
    stopGeneration,
  } = useContext(context);

  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);
  const hasMessages = currentMessages.length > 0;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, loading]);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (input.trim() && !loading) onSent();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestion = (prompt) => {
    setInput(prompt);
    onSent(prompt);
  };

  const handleRecentPrompt = (prompt) => {
    setInput(prompt);
    onSent(prompt);
  };

  // ── text formatter ──────────────────────────────────────────────────────────

  const formatResponse = (text) => {
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // code blocks
      .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
        `<pre class="code-block"><code>${code.trim()}</code></pre>`)
      // inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
      // bullet list
      .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
      // line breaks
      .replace(/\n/g, '<br/>');

    // wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>)(\s*(<br\/>)?\s*<li>)/g, '$1$2');
    html = html.replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>');
    return html;
  };

  // ── copy helper ─────────────────────────────────────────────────────────────

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className='main'>

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <div className="nav">
        <div className="nav-left">
          <p className="nav-title">Gen-nova</p>
          <button className="new-chat-btn" onClick={newChat} title="New chat">
            <img src={assets.plus_icon ?? assets.add_icon} alt="New" />
          </button>
        </div>
        <img src={assets.user_icon} alt="User" className="user-avatar" />
      </div>

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div className="main-container">

        {/* ── Welcome Screen ──────────────────────────────────────────────── */}
        {!hasMessages && (
          <>
            <div className="greet">
              <p><span>Hello, Dev.</span></p>
              <p>How can I help you today?</p>
            </div>

            {/* Recent prompts */}
            {recentPrompts.length > 0 && (
              <div className="recent-section">
                <p className="section-label">Recent</p>
                <div className="recent-list">
                  {recentPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      className="recent-chip"
                      onClick={() => handleRecentPrompt(prompt)}
                      title={prompt}
                    >
                      <img src={assets.history_icon ?? assets.clock_icon} alt="" />
                      <span>{prompt.length > 45 ? prompt.slice(0, 45) + '…' : prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion cards */}
            <div className="cards">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="card"
                  onClick={() => handleSuggestion(s.prompt)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSuggestion(s.prompt)}
                >
                  <p>{s.prompt}</p>
                  <span className="card-icon">{s.icon}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Conversation ────────────────────────────────────────────────── */}
        {hasMessages && (
          <div className="result">
            {currentMessages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>

                {/* Avatar */}
                <img
                  src={msg.role === 'user' ? assets.user_icon : assets.gemini_icon}
                  alt={msg.role}
                  className="message-avatar"
                />

                {/* Bubble */}
                <div className="message-bubble">
                  {msg.role === 'user' ? (
                    <p>{msg.text}</p>
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: formatResponse(msg.text) }} />
                  )}

                  {/* Actions (model messages only) */}
                  {msg.role === 'model' && (
                    <div className="msg-actions">
                      <button
                        className="action-btn"
                        onClick={() => copyToClipboard(msg.text)}
                        title="Copy"
                      >
                        <img src={assets.copy_icon} alt="Copy" />
                      </button>
                      {i === currentMessages.length - 1 && (
                        <button
                          className="action-btn"
                          onClick={regenerate}
                          title="Regenerate"
                          disabled={loading}
                        >
                          <img src={assets.refresh_icon ?? assets.reset_icon} alt="Regenerate" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="message-row model">
                <img src={assets.gemini_icon} alt="Gemini" className="message-avatar" />
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="error-banner">
                <p>⚠ {error}</p>
                <button onClick={regenerate}>Retry</button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* ── Input Bar ───────────────────────────────────────────────────── */}
        <div className="main-bottom">
          <div className={`search-box ${loading ? 'loading' : ''}`}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Ask Gemini anything…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              onKeyDown={handleKey}
            />
            <div className="search-actions">
              <img src={assets.gallery_icon} alt="Attach" title="Attach image" />
              <img src={assets.mic_icon}     alt="Voice"  title="Voice input" />
              {loading ? (
                <button className="stop-btn" onClick={stopGeneration} title="Stop">■</button>
              ) : (
                <img
                  src={assets.send_icon}
                  alt="Send"
                  title="Send"
                  className={input.trim() ? 'active' : ''}
                  onClick={handleSend}
                />
              )}
            </div>
          </div>
          <p className="bottom-info">
            Gemini can make mistakes. Consider checking important information.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Main;