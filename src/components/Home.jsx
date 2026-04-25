import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home({ onStart }) {
  const [id, setId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id.trim()) {
      onStart(id.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pixel-container"
    >
      <motion.h1 
        className="crt-effect"
        style={{ color: 'var(--color-primary)', fontSize: '40px', textAlign: 'center', marginBottom: '40px', textShadow: '4px 4px 0px rgba(57, 255, 20, 0.3)' }}
      >
        PIXEL QUIZ QUEST
      </motion.h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
        <input
          type="text"
          className="pixel-input"
          placeholder="ENTER ID..."
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button type="submit" className="pixel-button" style={{ maxWidth: '400px' }}>
          INSERT COIN
        </button>
      </form>
    </motion.div>
  );
}
