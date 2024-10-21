import React from 'react';

function Message({ role, content }) {
  // Helper function to parse and organize content
  const renderContent = (content) => {
    if (typeof content === 'string') {
      // Split content by new lines to handle different parts
      return content.split('\n').map((line, index) => {
        line = line.trim();

        // Handle ordered list (e.g., 1., 2., 3.)
        if (/^\d+\./.test(line)) {
          return <li key={index}>{line}</li>;
        }
        
        // Handle unordered list (e.g., -, *)
        if (/^[-*]/.test(line)) {
          return <li key={index}>{line.slice(1).trim()}</li>;
        }

        // Handle URLs (http or https)
        if (line.includes('http')) {
          const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
          return (
            <a href={urlMatch[0]} key={index} target="_blank" rel="noopener noreferrer">
              {line}
            </a>
          );
        }

        // Regular paragraph
        return <p key={index}>{line}</p>;
      });
    }

    return content; // Return raw content for non-string types (if any)
  };

  return (
    <div className={`message ${role === 'user' ? 'user' : ''}`}>
      {/* Dynamically render content */}
      {renderContent(content)}
    </div>
  );
}

export default Message;
