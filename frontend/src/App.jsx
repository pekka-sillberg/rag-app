import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Chatbox from './components/Chatbox';
import TopBar from './components/TopBar';
import Modal from './components/Modal';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // Set loading state here

  // const api_url = 'http://localhost:5000';
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

  const handleSendMessage = async (input) => {
    if (!input) return;

    setLoading(true); // Start loading
    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await axios.post(`${api_url}/api/query-embedding`, { query: input });
      const botMessage = { role: 'bot', content: response.data };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = { role: 'bot', content: 'Sorry, No results found for this query.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false); // Stop loading when response is received
    }
  };

  return (
    <>
      <div className="main">
        <Sidebar setInput={setInput} handleSendMessage={handleSendMessage} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div id="main-content">
          <TopBar openModal={openModal} toggleSidebar={toggleSidebar} />
          <Chatbox messages={messages} setMessages={setMessages} api_url={api_url} input={input} setInput={setInput} handleSendMessage={handleSendMessage} loading={loading} />
          <div className="right-footer">
            <p>GPT Lab &copy; 2024</p>
          </div>
        </div>
      </div>
      {showModal && <Modal closeModal={closeModal} />}
    </>
  );
}

export default App;
