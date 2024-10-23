import React from 'react';

const FaqCard = ({ setInput, handleSendMessage }) => {
    const handleQuestionClick = async (event) => {
        const question = event.target.textContent;
        // await setInput(question);
        handleSendMessage(question);
        setInput('');
    };

    return (
        <div className='faq-card'>
            <div onClick={handleQuestionClick} className="faq-card-item">
                <a >How can I obtain support for studying and well-being at Tampere University?</a>
            </div>
            <div onClick={handleQuestionClick} className="faq-card-item">
                <a >How do I get started with admission?</a>
            </div>
            <div onClick={handleQuestionClick} className="faq-card-item">
                <a >What support is offered for students with difficulties in learning?</a>
            </div>
            <div onClick={handleQuestionClick} className="faq-card-item">
                <a >How can I benefit from internationalization during my studies at Tampere University?</a>
            </div>
        </div>
    );
};

export default FaqCard;
