import React from 'react';

function Message({ role, content }) {
  // Helper function to parse and organize content
  const renderContent = (content) => {
    if (typeof content === 'string') {
      // Remove any unexpected spaces before or after the number in the link section
      const cleanedContent = content.replace(/(\d+\.\s+)<a/g, '$1<a');

      // Use dangerouslySetInnerHTML to render HTML tags in the string content
      return <div dangerouslySetInnerHTML={{ __html: cleanedContent }} />;
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
