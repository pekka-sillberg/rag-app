import React from 'react';
import { FaTimes } from 'react-icons/fa';  // Using React Icons for Close Button


function Sidebar({ setInput, isOpen, toggleSidebar, openModal }) {
  const handleQuestionClick = (event) => {
    const question = event.target.textContent;  // Get the clicked question text
    setInput(question);
    toggleSidebar();
};

  return (
    <nav id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="top-content">
        <div className="logo">
          <h2>Guide GPT</h2>
          <button onClick={toggleSidebar}>
            <FaTimes/>
          </button>
        </div>

        {/* <div className='faq'>
          <h4>FAQ</h4>
          <hr />
        </div> */}
        <ul>
          <li onClick={handleQuestionClick}>How can I obtain support for studying and well-being at Tampere University?</li>

          <li onClick={handleQuestionClick}>What resources are available for distance learning study skills?</li>

          <li onClick={handleQuestionClick}>How can I access additional resources for communication and language studies?</li>

          <li onClick={handleQuestionClick}>What support is offered for students with difficulties in learning?</li>

          <li onClick={handleQuestionClick}>How can I prepare for exams effectively at Tampere University?</li>

          <li onClick={handleQuestionClick}>What services and regulations are in place for students at Tampere University?</li>

          <li onClick={handleQuestionClick}>How can I benefit from internationalization during my studies at Tampere University?</li>

          <li onClick={handleQuestionClick}>What options are available for internships and work life experiences at Tampere University?</li>

          <li onClick={handleQuestionClick}>What support is provided for students seeking L2 Finnish language support?</li>

        </ul>
      </div>
      <div className="footer">
        <p>Tampere University</p>
      </div>
    </nav>
  );
}

export default Sidebar;
