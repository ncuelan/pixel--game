import React, { useState } from 'react';
import Login from './components/Login';
import Quiz from './components/Quiz';
import Result from './components/Result';
import './index.css';

const App = () => {
  const [gameState, setGameState] = useState('login'); // login | loading | quiz | result
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [avatars, setAvatars] = useState([]);
  const [resultData, setResultData] = useState(null);

  const scriptUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;
  const questionCount = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 5;
  const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || 3;

  const startGame = async (id) => {
    setUserId(id);
    setGameState('loading');
    
    try {
      // 預載關卡圖片
      const loadedAvatars = Array.from({ length: questionCount }).map((_, i) => 
        `https://api.dicebear.com/8.x/pixel-art/svg?seed=${id}_stage_${i}`
      );
      setAvatars(loadedAvatars);

      if (scriptUrl) {
        // 從 GAS 獲取題目
        const res = await fetch(`${scriptUrl}?action=getQuestions&count=${questionCount}`);
        const data = await res.json();
        
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          loadMockQuestions(); // 發生錯誤時使用 Mock
        }
      } else {
        loadMockQuestions();
      }
      
      setGameState('quiz');
      setScore(0);
    } catch (e) {
      console.error(e);
      loadMockQuestions();
      setGameState('quiz');
      setScore(0);
    }
  };

  const loadMockQuestions = () => {
    setQuestions([
      { id: 1, question: "這是一個測試題目，下列哪個是真正的像素遊戲？", options: [{label: 'A', text: 'Minecraft'}, {label: 'B', text: 'GTA'}, {label: 'C', text: 'FIFA'}, {label: 'D', text: 'Star Fox'}], answer: 'A' },
      { id: 2, question: "React 的主要功能是？", options: [{label: 'A', text: '資料庫'}, {label: 'B', text: '建構使用者介面'}, {label: 'C', text: '作業系統'}, {label: 'D', text: '影音編輯'}], answer: 'B' },
      { id: 3, question: "DiceBear 提供什麼服務？", options: [{label: 'A', text: '加密貨幣'}, {label: 'B', text: '大數據分析'}, {label: 'C', text: '產生頭像'}, {label: 'D', text: '訂便當'}], answer: 'C'}
    ].slice(0, questionCount));
  };

  const finishQuiz = async (finalScore) => {
    setScore(finalScore);
    setGameState('loading'); // loading result
    
    const isPassed = finalScore >= passThreshold;
    
    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'submitScore',
            id: userId,
            score: finalScore,
            isPassed: isPassed
          })
        });
        const data = await res.json();
        setResultData(data);
      } catch (e) {
        console.error(e);
      }
    }
    
    setGameState('result');
  };

  return (
    <div className="app-container">
      {gameState === 'login' && <Login onStart={startGame} />}
      {gameState === 'loading' && (
        <div className="pixel-panel floating">
          <h2 className="title" style={{marginTop: '20px'}}>LOADING...</h2>
        </div>
      )}
      {gameState === 'quiz' && (
        <Quiz 
          questions={questions} 
          avatars={avatars} 
          onFinish={finishQuiz} 
        />
      )}
      {gameState === 'result' && (
        <Result 
          score={score} 
          total={questions.length} 
          threshold={passThreshold} 
          resultData={resultData}
          onRestart={() => setGameState('login')}
        />
      )}
    </div>
  );
};

export default App;
