import React from 'react';

function Modal({ closeModal }) {
  return (
    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0, 0, 0, 0.5)' }} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">What is the source?</h5>
            <button type="button" className="close" onClick={closeModal}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>AskGPT is a chatbot application powered by advanced AI models like GPT. You can ask questions from different domains, including AI, programming, and more!</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
