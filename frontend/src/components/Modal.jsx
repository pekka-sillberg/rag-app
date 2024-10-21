import React from 'react';
import { FaTimes } from 'react-icons/fa';  // Using React Icons for Close Button

function Modal({ closeModal }) {
  return (
    <div className="modal fade show" tabIndex="-1" role="dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">About AskGPT</h5>
          <button type="button" className="close" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p>This useful chatbot helps students find necessary details and guidelines of Tampere university. You can find useful sample question on the sidebar. <br /> <b>Data source: </b> <a href="https://www.tuni.fi/en/students-guide/students-guide">https://www.tuni.fi/en/students-guide/students-guide</a></p>
        </div>
      </div>
    </div>
  );
}

export default Modal;
