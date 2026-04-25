import React from 'react';

const Result = ({ score, total, threshold, resultData, onRestart }) => {
  const isPassed = score >= threshold;

  return (
    <div className="pixel-panel floating">
      <h1 className="title" style={{ color: isPassed ? 'var(--success)' : 'var(--error)' }}>
        {isPassed ? 'STAGE CLEAR!' : 'GAME OVER'}
      </h1>
      
      <div style={{ fontSize: '1.5rem', marginBottom: '20px', fontFamily: '"Press Start 2P"' }}>
        YOUR SCORE<br/>
        <span style={{color: 'var(--primary-color)', fontSize: '2rem', display: 'inline-block', margin: '20px 0'}}>{score} / {total}</span>
      </div>

      <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '15px', marginBottom: '30px', border: '2px solid var(--border-color)', fontSize: '0.9rem', lineHeight: '1.5' }}>
        {resultData ? (
          <>
            <p style={{color: 'var(--success)'}}><strong>[系統提示] 同步伺服器成功</strong></p>
            {resultData.isNewUser ? (
              <p>新玩家初次登錄！</p>
            ) : (
              <p>歡迎回來，老玩家！</p>
            )}
            <p>※詳細記錄詳見 Google Sheet 端</p>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>[系統提示] 離線遊玩模式，無後端連線。</p>
        )}
      </div>

      <button className="pixel-btn" onClick={onRestart}>
        PLAY AGAIN
      </button>
    </div>
  );
};

export default Result;
