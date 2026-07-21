import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import './InteractiveQuiz.css';

const parseQuizData = (rawText) => {
  try {
    // Find the first '[' and last ']' to extract the JSON array even if there is surrounding text
    const startIndex = rawText.indexOf('[');
    const endIndex = rawText.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      const jsonStr = rawText.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    }
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Failed to parse quiz JSON", err);
    return null;
  }
};

const InteractiveQuiz = ({ data, onReset }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionIndex: { selected: opt, isCorrect: boolean } }

  useEffect(() => {
    const parsed = parseQuizData(data);
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      setQuestions(parsed);
    } else {
      setQuestions(null);
    }
  }, [data]);

  const handleOptionSelect = (qIndex, opt) => {
    if (answers[qIndex]) return; // already answered

    const currentQ = questions[qIndex];
    const isCorrect = opt === currentQ.correctAnswer;
    
    setAnswers(prev => ({
      ...prev,
      [qIndex]: { selected: opt, isCorrect }
    }));
  };

  const handleRetake = () => {
    setAnswers({});
    if (onReset) onReset();
  };

  if (questions === null) {
    return (
      <div className="quiz-error">
        <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
        <h3>Failed to load quiz</h3>
        <p>The AI response did not contain a valid interactive quiz format. Please try generating it again.</p>
      </div>
    );
  }

  if (questions.length === 0) return <div>Loading quiz...</div>;

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="quiz-container" style={{ padding: '2rem 1rem' }}>
      <div className="quiz-header" style={{ position: 'sticky', top: '0', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Quiz Score: {correctCount} / {answeredCount} (Total: {totalCount})
          </div>
          <button className="quiz-btn quiz-btn-secondary" onClick={handleRetake} style={{ padding: '8px 16px', fontSize: '14px' }}>
            <RotateCcw size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Reset Quiz
          </button>
        </div>
        <div className="quiz-progress-bar-container" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <div className="quiz-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {questions.map((currentQ, currentIndex) => {
          const currentAns = answers[currentIndex];
          const hasSubmitted = !!currentAns;
          
          return (
            <div className="quiz-question-card" key={`q-${currentIndex}`} style={{ margin: 0 }}>
              <div className="quiz-question-text">
                <span style={{ color: 'var(--text-secondary)', marginRight: '8px', fontSize: '0.9em' }}>{currentIndex + 1}.</span> 
                {currentQ.question}
              </div>
              
              <div className="quiz-options">
                {currentQ.options.map((opt, idx) => {
                  const letter = optionLetters[idx] || '?';
                  let classNames = "quiz-option";
                  
                  if (hasSubmitted) {
                    classNames += " disabled";
                    if (opt === currentQ.correctAnswer) {
                      classNames += " correct";
                    } else if (opt === currentAns.selected && opt !== currentQ.correctAnswer) {
                      classNames += " wrong";
                    }
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={classNames}
                      onClick={() => handleOptionSelect(currentIndex, opt)}
                    >
                      <span className="quiz-option-letter">{letter}</span>
                      {opt}
                    </div>
                  );
                })}
              </div>
              
              {hasSubmitted && (
                <div className={`quiz-feedback ${currentAns.isCorrect ? 'correct' : 'wrong'}`} style={{ marginTop: '1.5rem' }}>
                  <div className="quiz-feedback-title">
                    {currentAns.isCorrect ? (
                      <><CheckCircle size={24} color="#22C55E" /> Correct! Excellent!</>
                    ) : (
                      <><XCircle size={24} color="#EF4444" /> Incorrect</>
                    )}
                  </div>
                  <div className="quiz-explanation">
                    <strong>Explanation:</strong><br/>
                    {currentQ.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveQuiz;
