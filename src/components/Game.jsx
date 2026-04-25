import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuestions } from '../services/api';
import { getRandomAvatar } from '../utils/avatars';

export default function Game({ userId, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const initGame = async () => {
      try {
        const count = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5', 10);
        const data = await fetchQuestions(count);
        setQuestions(data);
        setAvatar(getRandomAvatar());
        setLoading(false);
      } catch (error) {
        console.error("Failed to load game", error);
      }
    };
    initGame();
  }, []);

  const handleAnswer = (option) => {
    const currentQ = questions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: option };
    
    if (currentIndex < questions.length - 1) {
      setAnswers(newAnswers);
      setAvatar(getRandomAvatar());
      setCurrentIndex(prev => prev + 1);
    } else {
      setAnswers(newAnswers);
      onFinish(newAnswers);
    }
  };

  if (loading) {
    return (
      <div className="pixel-container crt-effect">
        <h2 style={{ color: 'var(--color-primary)' }}>LOADING STAGE...</h2>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="pixel-container" style={{ justifyContent: 'flex-start', paddingTop: '10vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px', color: 'var(--color-secondary)' }}>
        <span>ID: {userId}</span>
        <span>STAGE {currentIndex + 1}/{questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
        >
          <div style={{ 
            width: '150px', 
            height: '150px', 
            background: 'var(--color-primary)', 
            padding: '4px',
            marginBottom: '30px',
            boxShadow: '8px 8px 0px rgba(57, 255, 20, 0.2)'
          }}>
            <img src={avatar} alt="Boss Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} />
          </div>

          <div style={{ 
            background: 'rgba(0,0,0,0.8)', 
            border: '4px solid var(--color-primary)', 
            padding: '20px', 
            marginBottom: '30px',
            width: '100%',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            {currentQ.question}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
            {options.map((opt) => (
              <button 
                key={opt}
                className="pixel-button" 
                onClick={() => handleAnswer(opt)}
                style={{ fontSize: '14px' }}
              >
                {opt}: {currentQ[opt]}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
