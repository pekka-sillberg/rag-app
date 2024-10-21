import React from 'react';

function Message({ role, content }) {
  return (
    <div className={`message ${role === 'user' ? 'user' : ''}`}>
      {content}
    </div>
  );
}

export default Message;
