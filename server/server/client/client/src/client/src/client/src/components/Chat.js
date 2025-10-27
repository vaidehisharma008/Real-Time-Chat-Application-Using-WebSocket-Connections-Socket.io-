import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// Change this to your server url if needed
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      console.log('connected to server', s.id);
    });

    s.on('message', (msg) => {
      // msg can be system message or user message
      setMessages(prev => [...prev, msg]);
    });

    s.on('disconnect', () => {
      setConnected(false);
      console.log('disconnected');
    });

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    // auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    if (!text.trim() || !socket) return;

    const payload = { name: name.trim() || 'Anonymous', text: text.trim() };
    socket.emit('chatMessage', payload);
    setText('');
  };

  return (
    <div className="chat-container">
      <div className="chat-left">
        <div className="connection">
          <label>
            Your name:
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className={`status ${connected ? 'online' : 'offline'}`}>
            {connected ? '● Connected' : '○ Disconnected'}
          </div>
        </div>

        <div className="messages" aria-live="polite">
          {messages.length === 0 && <p className="muted">No messages yet — say hi 👋</p>}
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`message ${m.system ? 'system' : 'user'}`}
            >
              {m.system ? (
                <div className="system-text">{m.text}</div>
              ) : (
                <>
                  <div className="meta">
                    <strong>{m.name}</strong>
                    <span className="time">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text">{m.text}</div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-right">
        <form onSubmit={sendMessage} className="composer">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>

        <div className="instructions">
          <h4>How to test</h4>
          <ol>
            <li>Open this app in multiple windows or devices.</li>
            <li>Enter your name and type a message.</li>
            <li>All clients will receive messages instantly — no refresh needed.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Chat;
