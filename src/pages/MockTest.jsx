import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuestionsForChapters, getFullMockQuestions, getFullNEETMockQuestions, NEET_CONFIG } from '../data/questions';
import { useAuth } from '../context/AuthContext';
import { submitTest } from '../services/api';
import './MockTest.css';

const MockTest = ({ testConfig, setTestResults }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Initialize test
  useEffect(() => {
    if (!testConfig) {
      navigate('/select');
      return;
    }

    let loadedQuestions;
    let time;

    if (testConfig.mode === 'neet') {
      // Full NEET Mock Test - 180 questions, 3 hours
      loadedQuestions = getFullNEETMockQuestions();
      time = NEET_CONFIG.duration * 60; // 3 hours in seconds
    } else if (testConfig.mode === 'full') {
      loadedQuestions = getFullMockQuestions(180);
      time = Math.max(loadedQuestions.length * 180, 1800);
    } else {
      loadedQuestions = getQuestionsForChapters(testConfig.chapters);
      // 1.5 minutes per question for custom tests
      time = Math.max(loadedQuestions.length * 90, 1800);
    }

    setQuestions(loadedQuestions);
    setTimeRemaining(time);
  }, [testConfig, navigate]);

  // Timer - pauses when isPaused is true
  useEffect(() => {
    if (timeRemaining <= 0 || isSubmitting || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitting, isPaused]);

  // Pause/Resume handlers
  const handlePause = () => {
    setIsPaused(true);
    setShowPauseModal(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    setShowPauseModal(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentIndex)) {
        newSet.delete(currentIndex);
      } else {
        newSet.add(currentIndex);
      }
      return newSet;
    });
  };

  const clearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentIndex];
      return newAnswers;
    });
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);

    // Calculate results
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const questionResults = questions.map((q, idx) => {
      const userAnswer = answers[idx];
      const isCorrect = userAnswer === q.correct;
      const isAttempted = userAnswer !== undefined;

      if (!isAttempted) {
        unattempted++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      return {
        ...q,
        userAnswer,
        isCorrect: isAttempted ? isCorrect : null,
        isAttempted
      };
    });

    // NEET marking scheme: +4 for correct, -1 for incorrect
    const score = (correct * NEET_CONFIG.marksPerCorrect) + (incorrect * NEET_CONFIG.marksPerWrong);
    const maxScore = questions.length * NEET_CONFIG.marksPerCorrect;

    const results = {
      questions: questionResults,
      summary: {
        total: questions.length,
        attempted: questions.length - unattempted,
        correct,
        incorrect,
        unattempted,
        score,
        maxScore,
        percentage: ((score / maxScore) * 100).toFixed(1),
        timeSpent: testConfig.mode === 'full'
          ? Math.max(180 * questions.length, 1800) - timeRemaining
          : Math.max(questions.length * 180, 1800) - timeRemaining
      }
    };

    setTestResults(results);
    navigate('/results');

    // Fire-and-forget: submit to backend if logged in
    if (user) {
      const testType = testConfig.mode === 'neet' ? 'neet'
        : testConfig.mode === 'full' ? 'full' : 'chapter';

      const initialTime = testConfig.mode === 'neet'
        ? NEET_CONFIG.duration * 60
        : testConfig.mode === 'full'
          ? Math.max(180 * questions.length, 1800)
          : Math.max(questions.length * 90, 1800);

      submitTest({
        testType,
        timeTaken: initialTime - timeRemaining,
        questions: questionResults.map((q) => ({
          subject: q.subject,
          chapter: q.chapter,
          userAnswer: q.userAnswer ?? null,
          correctIndex: q.correct,
          isCorrect: !!q.isCorrect,
          isAttempted: q.isAttempted,
        })),
      }).catch(() => {
        // Silently fail — don't break UX
      });
    }
  }, [questions, answers, testConfig, timeRemaining, setTestResults, navigate, user]);

  const getQuestionStatus = (index) => {
    const isAnswered = answers[index] !== undefined;
    const isMarked = markedForReview.has(index);
    const isCurrent = index === currentIndex;

    if (isCurrent) return 'current';
    if (isMarked && isAnswered) return 'marked-answered';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'not-visited';
  };

  const getSubjectClass = (subject) => {
    switch (subject?.toLowerCase()) {
      case 'physics': return 'physics';
      case 'chemistry': return 'chemistry';
      case 'biology': return 'biology';
      default: return '';
    }
  };

  if (questions.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;

  return (
    <div className="mock-test">
      {/* Header */}
      <header className="test-header">
        <div className="header-left">
          <div className="test-title">
            <h1>{testConfig?.mode === 'neet' ? 'NEET Full Mock Test' : 'NEET Practice Test'}</h1>
            <span className="question-counter">
              Question {currentIndex + 1} of {questions.length}
              {testConfig?.mode === 'neet' && (
                <span className="neet-info"> | {NEET_CONFIG.totalMarks} marks | +{NEET_CONFIG.marksPerCorrect}/{NEET_CONFIG.marksPerWrong}</span>
              )}
            </span>
          </div>
        </div>

        <div className="header-center">
          <div className={`timer ${timeRemaining < 300 ? 'warning' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 5V10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="header-right">
          <button
            className="pause-btn"
            onClick={handlePause}
            title="Take a break"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="3" width="4" height="14" rx="1" fill="currentColor"/>
              <rect x="12" y="3" width="4" height="14" rx="1" fill="currentColor"/>
            </svg>
            Pause
          </button>
          <button
            className="nav-toggle"
            onClick={() => setShowQuestionNav(!showQuestionNav)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            className="btn btn-primary submit-btn"
            onClick={() => setShowConfirmSubmit(true)}
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="test-content">
        {/* Question Panel */}
        <main className="question-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className={`question-card subject-${getSubjectClass(currentQuestion.subject)}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question Header */}
              <div className="question-header">
                <div className="question-meta">
                  <span className="subject-badge">{currentQuestion.subject}</span>
                  <span className="chapter-badge">{currentQuestion.chapter}</span>
                  {currentQuestion.year && (
                    <span className="year-badge">NEET {currentQuestion.year}</span>
                  )}
                </div>
                <button
                  className={`mark-btn ${markedForReview.has(currentIndex) ? 'marked' : ''}`}
                  onClick={handleMarkForReview}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 3V15.75L9 12L15 15.75V3C15 2.58579 14.6642 2.25 14.25 2.25H3.75C3.33579 2.25 3 2.58579 3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={markedForReview.has(currentIndex) ? 'currentColor' : 'none'}/>
                  </svg>
                  {markedForReview.has(currentIndex) ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              {/* Question Text */}
              <div className="question-text">
                <p>{currentQuestion.question}</p>
              </div>

              {/* Options */}
              <div className="options-list">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    className={`option ${answers[currentIndex] === idx ? 'selected' : ''}`}
                    onClick={() => handleAnswer(idx)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="option-text">{option}</span>
                    {answers[currentIndex] === idx && (
                      <span className="option-check">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Question Actions */}
              <div className="question-actions">
                <button
                  className="action-btn"
                  onClick={clearResponse}
                  disabled={answers[currentIndex] === undefined}
                >
                  Clear Response
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="question-nav-buttons">
            <button
              className="nav-btn"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11.25 13.5L6.75 9L11.25 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>

            <button
              className="nav-btn nav-btn-primary"
              onClick={nextQuestion}
              disabled={currentIndex === questions.length - 1}
            >
              Next
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </main>

        {/* Question Navigator */}
        <aside className={`question-navigator ${showQuestionNav ? 'visible' : ''}`}>
          <div className="nav-header">
            <h3>Questions</h3>
            <button className="close-nav" onClick={() => setShowQuestionNav(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="nav-legend">
            <div className="legend-item">
              <span className="legend-dot answered"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot marked"></span>
              <span>Marked ({markedCount})</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot not-visited"></span>
              <span>Not Visited</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="nav-grid">
            {questions.map((_, idx) => (
              <button
                key={idx}
                className={`nav-item ${getQuestionStatus(idx)}`}
                onClick={() => goToQuestion(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Pause Modal */}
      <AnimatePresence>
        {showPauseModal && (
          <motion.div
            className="modal-overlay pause-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content pause-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="pause-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" fill="none"/>
                  <rect x="22" y="20" width="6" height="24" rx="2" fill="currentColor"/>
                  <rect x="36" y="20" width="6" height="24" rx="2" fill="currentColor"/>
                </svg>
              </div>
              <h2>Test Paused</h2>
              <p className="pause-message">Take a break! Your progress is saved and the timer is paused.</p>
              <div className="pause-stats">
                <div className="pause-stat">
                  <span className="stat-icon">⏱️</span>
                  <span className="stat-info">
                    <span className="stat-value">{formatTime(timeRemaining)}</span>
                    <span className="stat-label">Time Remaining</span>
                  </span>
                </div>
                <div className="pause-stat">
                  <span className="stat-icon">✅</span>
                  <span className="stat-info">
                    <span className="stat-value">{answeredCount}/{questions.length}</span>
                    <span className="stat-label">Questions Answered</span>
                  </span>
                </div>
              </div>
              <div className="pause-tips">
                <h4>Quick Tips:</h4>
                <ul>
                  <li>Stretch and relax your eyes</li>
                  <li>Take deep breaths</li>
                  <li>Drink some water</li>
                </ul>
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-primary btn-lg resume-btn"
                  onClick={handleResume}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 4L16 10L6 16V4Z" fill="currentColor"/>
                  </svg>
                  Resume Test
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2>Submit Test?</h2>
              <div className="modal-stats">
                <div className="modal-stat">
                  <span className="stat-value">{answeredCount}</span>
                  <span className="stat-label">Answered</span>
                </div>
                <div className="modal-stat">
                  <span className="stat-value">{questions.length - answeredCount}</span>
                  <span className="stat-label">Unanswered</span>
                </div>
                <div className="modal-stat">
                  <span className="stat-value">{markedCount}</span>
                  <span className="stat-label">Marked</span>
                </div>
              </div>
              <p className="modal-warning">
                {questions.length - answeredCount > 0
                  ? `You have ${questions.length - answeredCount} unanswered questions. Are you sure you want to submit?`
                  : 'Are you sure you want to submit the test?'}
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Continue Test
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Submit Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MockTest;
