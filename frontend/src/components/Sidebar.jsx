import React from 'react';
import { FaTimes } from 'react-icons/fa';

function Sidebar({ faqs, setInput, handleQuestionClick, isOpen, toggleSidebar }) {
  // Preset questions to display if there are no FAQs from the database
  const presetQuestions = [
    "How can I obtain support for studying and well-being at Tampere University?",
    "What resources are available for distance learning study skills?",
    "How can I access additional resources for communication and language studies?",
    "What support is offered for students with difficulties in learning?",
    "How can I prepare for exams effectively at Tampere University?",
    "What services and regulations are in place for students at Tampere University?",
    "How can I benefit from internationalization during my studies at Tampere University?",
    "What options are available for internships and work-life experiences at Tampere University?"
  ];

  const questionsToShow = faqs.length > 5 ? faqs : presetQuestions;

  return (
    <nav id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="top-content">
        <div className="logo">
          <h2>Guide GPT</h2>
          <button onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        <h3>FAQ</h3>
        <hr />
        <ul>
          {questionsToShow.map((faq, index) => (
            <li
              key={index}
              onClick={() => handleQuestionClick(typeof faq === 'string' ? faq : faq.question)}
            >
              {typeof faq === 'string' ? faq : faq.question}
            </li>
          ))}
        </ul>
      </div>
      <div className="footer">
        <p>Tampere University</p>
      </div>
    </nav>
  );
}

export default Sidebar;
