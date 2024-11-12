import React from 'react';
import { FaTimes } from 'react-icons/fa';

function Sidebar({ setInput, handleSendMessage, isOpen, toggleSidebar }) {
  const handleQuestionClick = (event) => {
    const question = event.target.textContent;
    setInput(question);
    handleSendMessage(question);  // Trigger the API call after setting input
    setInput('');  // Clear the input after sending the message
    toggleSidebar();
  };

  return (
    <nav id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="top-content">
        <div className="logo">
          <h2>Guide GPT</h2>
          <button onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        <ul>
          <li onClick={handleQuestionClick}>How can I obtain support for studying and well-being at Tampere University?</li>
          <li onClick={handleQuestionClick}>What resources are available for distance learning study skills?</li>
          <li onClick={handleQuestionClick}>How can I access additional resources for communication and language studies?</li>
          <li onClick={handleQuestionClick}>What support is offered for students with difficulties in learning?</li>
          <li onClick={handleQuestionClick}>How can I prepare for exams effectively at Tampere University?</li>
          <li onClick={handleQuestionClick}>What services and regulations are in place for students at Tampere University?</li>
          <li onClick={handleQuestionClick}>How can I benefit from internationalization during my studies at Tampere University?</li>
          <li onClick={handleQuestionClick}>What options are available for internships and work life experiences at Tampere University?</li>
        </ul>
      </div>
      <div className="footer">
        <p>Tampere University</p>
      </div>
    </nav>
  );
}

export default Sidebar;
