import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitAnswers } from '../services/api';

export default function Result({ userId, answers, onRestart }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processResult = async () => {
      try {
        const data = await submitAnswers(userId, answers);
        setResult(data);
      } catch (err) {
        setError('TRANSMISSION FAILED. PLEASE TRY AGAIN.');
      }
    };
    processResult();
  }, [userId, answers]);

  if (error) {
    return (
      <div className="pixel-container">
        <h2 style={{ color: 'red' }}>{error}</h2>
        <button className="pixel-button" onClick={onRestart} style={{ marginTop: '20px' }}>RETRY</button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="pixel-container crt-effect">
        <h2 style={{ color: 'var(--color-primary)' }}>CALCULATING SCORE...</h2>
      </div>
    );
  }

  const { score, isPass } = result;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="pixel-container"
    >
      <h1 className="crt-effect" style={{ 
        color: isPass ? 'var(--color-primary)' : 'red', 
        fontSize: '48px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {isPass ? 'STAGE CLEARED!' : 'GAME OVER'}
      </h1>
      
      <div style={{ fontSize: '24px', marginBottom: '40px' }}>
        FINAL SCORE: <span style={{ color: 'var(--color-secondary)' }}>{score}</span>
      </div>

      <button className="pixel-button" onClick={onRestart} style={{ maxWidth: '300px' }}>
        PLAY AGAIN
      </button>
    </motion.div>
  );
}
