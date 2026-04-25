import React, { useState } from 'react';

const Quiz = ({ questions, avatars, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex];
  
  const handleAnswer = (selectedLabel) => {
    const isCorrect = selectedLabel === currentQ.answer;
    const newScore = score + (isCorrect ? 1 : 0);
    
    if (currentIndex < questions.length - 1) {
      setScore(newScore);
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(newScore);
    }
  };

  const progressPct = ((currentIndex) / questions.length) * 100;

  if (!currentQ) return <div className="pixel-panel floating"><h2 className="title" style={{marginTop: '20px'}}>Loading...</h2></div>;

  return (
    <div className="pixel-panel">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontFamily: '"Press Start 2P", monospace', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
        <span>STAGE {currentIndex + 1}/{questions.length}</span>
        <span>SCORE: {score}</span>
      </div>

      <img 
        src={avatars[currentIndex] || `https://api.dicebear.com/8.x/pixel-art/svg?seed=boss_${currentIndex}`} 
        className="avatar floating" 
        alt="Boss Avatar" 
      />

      <h3 style={{ fontSize: '1.2rem', margin: '20px 0', lineHeight: 1.5, textAlign: 'left' }}>
        Q: {currentQ.question}
      </h3>

      <div className="options-grid">
        {currentQ.options.map((opt) => (
          <button 
            key={opt.label} 
            className="pixel-btn option-btn"
            onClick={() => handleAnswer(opt.label)}
          >
            {opt.label}. {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
