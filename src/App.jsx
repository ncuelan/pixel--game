import { useState, useEffect } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import Result from './components/Result';
import { preloadImages } from './utils/avatars';

export default function App() {
  const [gameState, setGameState] = useState('home'); // home, game, result
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    // Preload pixel avatars in the background
    preloadImages();
  }, []);

  const handleStart = (id) => {
    setUserId(id);
    setGameState('game');
  };

  const handleFinish = (finalAnswers) => {
    setAnswers(finalAnswers);
    setGameState('result');
  };

  const handleRestart = () => {
    setGameState('home');
    setAnswers(null);
  };

  return (
    <>
      {gameState === 'home' && <Home onStart={handleStart} />}
      {gameState === 'game' && <Game userId={userId} onFinish={handleFinish} />}
      {gameState === 'result' && <Result userId={userId} answers={answers} onRestart={handleRestart} />}
    </>
  );
}
