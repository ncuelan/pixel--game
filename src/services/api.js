const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

// Mock data to enable offline development and testing
const mockQuestions = [
  { id: '1', question: 'What does CSS stand for?', A: 'Computer Style Sheets', B: 'Cascading Style Sheets', C: 'Creative Style Sheets', D: 'Colorful Style Sheets' },
  { id: '2', question: 'Which HTML tag is used for the largest heading?', A: '<heading>', B: '<h6>', C: '<head>', D: '<h1>' },
  { id: '3', question: 'What is the correct way to write a JavaScript array?', A: 'var colors = ["red", "green", "blue"]', B: 'var colors = (1:"red", 2:"green", 3:"blue")', C: 'var colors = "red", "green", "blue"', D: 'var colors = 1 = ("red"), 2 = ("green"), 3 = ("blue")' },
  { id: '4', question: 'How do you create a function in JavaScript?', A: 'function myFunction()', B: 'function:myFunction()', C: 'function = myFunction()', D: 'create myFunction()' },
  { id: '5', question: 'Which property is used to change the background color?', A: 'color', B: 'bgcolor', C: 'background-color', D: 'background' }
];

export async function fetchQuestions(count) {
  try {
    if (!GAS_URL || GAS_URL.includes('Mock_Url')) {
      console.warn('Using mock data for questions');
      return new Promise((resolve) => setTimeout(() => resolve(mockQuestions.slice(0, count)), 1000));
    }

    const response = await fetch(`${GAS_URL}?action=getQuestions&count=${count}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
}

export async function submitAnswers(id, answers) {
  try {
    if (!GAS_URL || GAS_URL.includes('Mock_Url')) {
      console.warn('Using mock scoring');
      return new Promise((resolve) => setTimeout(() => {
        // Mock scoring logic: Count A's as correct
        let score = 0;
        let correctCount = 0;
        Object.values(answers).forEach((ans) => {
          if (ans) { // Randomly assigning correctness for demo
            score += 20;
            correctCount++;
          }
        });
        const threshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3', 10);
        resolve({
          score,
          isPass: correctCount >= threshold,
          correctCount
        });
      }, 1500));
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'submit',
        id,
        answers,
      }),
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to submit answers:', error);
    throw error;
  }
}
