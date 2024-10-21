import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Chatbox from './components/Chatbox';
import TopBar from './components/TopBar';
import Modal from './components/Modal';
import { FaBars } from 'react-icons/fa';  // Using React Icons
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const api_url =  'https://rag-app-iivc.onrender.com';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="main">
      <button id="menu-toggle" onClick={toggleSidebar} className="hamburger">
        <FaBars /> {/* Using React Icon */}
      </button>
      <Sidebar setInput={setInput} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} openModal={openModal} />
      <div id="main-content">
        <TopBar />
        <Chatbox messages={messages} setMessages={setMessages} api_url={api_url} input={input} setInput={setInput} />
      </div>
      {showModal && <Modal closeModal={closeModal} />}
    </div>
  );
}

export default App;
