import React, { useState, useEffect } from 'react';

const PermissionModal = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const hasAccepted = localStorage.getItem('cookieAccepted');
      if (!hasAccepted) {
        setIsVisible(true);
      }
    }, []);
  
    const handleClose = () => {
      setIsVisible(false);
      localStorage.setItem('cookieAccepted', 'true');
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="cookie-modal-overlay">
        <div className="cookie-modal">
          <p>Please don't provide any personal information.We only collect the question for future improvements.</p>
          <button className="cookie-modal-close" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    );
  };

export default PermissionModal;
