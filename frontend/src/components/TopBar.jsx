import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';  
import { FaBars } from 'react-icons/fa';  // Using React Icons


function TopBar({openModal,toggleSidebar}) {
  return (
    <div className="top-bar mb-2">
      <button id="menu-toggle" onClick={toggleSidebar}  className="hamburger">
        <FaBars /> 
      </button>
      <a href="https://www.tuni.fi/" target='blank'>Tampere University</a>
      <button id="infoButton" className="btn info-button" onClick={openModal}>
          <FaInfoCircle className='info-icon'/> {/* Using React Icon */}
        </button>
    </div>
  );
}

export default TopBar;
