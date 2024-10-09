import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS for styling

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [trainInput, setTrainInput] = useState('');
  const [trainMessage, setTrainMessage] = useState('');
  const chatEndRef = useRef(null); // Reference to the end of the chat

  // Function to handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input) return;

    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/query-embedding', { query: input });
      const botMessage = { role: 'bot', content: response.data };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setInput('');
    }
  };

  // Function to handle training the model
  const handleTrainModel = async (e) => {
    e.preventDefault();
    if (!trainInput) return;

    try {
      await axios.post('http://localhost:5000/api/document', { url: trainInput });
      setTrainMessage('Document uploaded successfully.');
      setTrainInput('');
    } catch (error) {
      console.error('Error training model:', error);
      setTrainMessage('Failed to upload document.');
    }
  };


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (trainMessage) {
      const timer = setTimeout(() => {
        setTrainMessage(''); 
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [messages,trainMessage]);

  return (
    <>
    <div className="app">
      <div className="chat-container">
      <h1 >Tuni ChatBot</h1>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {/* <span>{msg.role === 'user' ? 'You: ' : 'Bot: '}</span> */}
              {msg.content}
            </div>
          ))}
          {/* Scroll marker */}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
        </div>
      <div className="train-container">
        <form onSubmit={handleTrainModel}>
          <input
            type="text"
            placeholder="Enter URL..."
            value={trainInput}
            onChange={(e) => setTrainInput(e.target.value)}
          />
          <button type="submit">Feed</button>
        </form>
        {trainMessage && <p className='success-message'>{trainMessage}</p>}
      </div>
      </>
  );
}

export default App;
