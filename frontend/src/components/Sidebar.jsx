import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';  // Using React Icons for Info Button

function Sidebar({ setInput, isOpen, toggleSidebar, openModal }) {
  const handleQuestionClick = (question) => {
    setInput(question); 
    toggleSidebar();  
  };

  return (
    <nav id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="logo">
        <h2>AskGPT</h2>
        <button id="infoButton" className="btn info-button" onClick={openModal}>
          <FaInfoCircle /> {/* Using React Icon */}
        </button>
      </div>
      <div>
        <h4>Frequently Asked Questions</h4>
        <hr />
      </div>
      <ul>
        <li onClick={() => handleQuestionClick('What is GPT?')}>What is GPT?</li>
        <li onClick={() => handleQuestionClick('How does it work?')}>How does it work?</li>
        <li onClick={() => handleQuestionClick('Common uses')}>Common uses</li>
        <li onClick={() => handleQuestionClick('Data & Security')}>Data & Security</li>
      </ul>
      <div className="footer">
        <p>AskGPT &copy; 2021</p>
      </div>
    </nav>
  );
}

export default Sidebar;
