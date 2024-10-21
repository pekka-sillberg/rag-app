import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Chatbox from './components/Chatbox';
import TopBar from './components/TopBar';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const api_url = 'https://rag-app-iivc.onrender.com';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (<>
    <div className="main">
      <Sidebar setInput={setInput} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div id="main-content">
        <TopBar openModal={openModal} toggleSidebar={toggleSidebar} />
        <Chatbox messages={messages} setMessages={setMessages} api_url={api_url} input={input} setInput={setInput} />
        <div className=" right-footer">
          <p>AskGPT &copy; 2024</p>
        </div>
      </div>
    </div>
    {showModal && <Modal closeModal={closeModal} />}
  </>
  );
}

export default App;
