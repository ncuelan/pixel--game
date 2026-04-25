import React, { useState } from 'react';

const Login = ({ onStart }) => {
  const [id, setId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id.trim()) {
      onStart(id.trim());
    }
  };

  return (
    <div className="pixel-panel floating">
      <h1 className="title" style={{fontSize: '2rem'}}>PIXEL QUIZ<br/>ARCADE</h1>
      <p style={{ marginBottom: '30px' }}>請輸入 USER ID 開始闖關</p>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="pixel-input" 
          placeholder="USER_ID" 
          value={id}
          onChange={(e) => setId(e.target.value)}
          autoFocus
        />
        <br/>
        <button type="submit" className="pixel-btn" disabled={!id.trim()}>
          INSERT COIN
        </button>
      </form>
    </div>
  );
};

export default Login;
