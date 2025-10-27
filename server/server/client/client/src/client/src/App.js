import React from 'react';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>💬 Real-Time Chat</h1>
        <p>Built with Socket.io, Express & React</p>
      </header>
      <main>
        <Chat />
      </main>
      <footer>
        <small>Open multiple browser windows to test real-time messaging</small>
      </footer>
    </div>
  );
}

export default App;
