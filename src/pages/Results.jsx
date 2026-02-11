import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Results.css';

const Results = ({ results }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  if (!results) {
    return (
      <div className="no-results">
        <h2>No Results Available</h2>
        <p>Please complete a test first to see your results.</p>
        <button className="btn btn-primary" onClick={() => navigate('/select')}>
          Start a Test
        </button>
      </div>
    );
  }

  const { summary, questions } = results;

  const subjectStats = useMemo(() => {
    const stats = {};
    questions.forEach(q => {
      if (!stats[q.subject]) {
        stats[q.subject] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
      }
      stats[q.subject].total++;
      if (!q.isAttempted) {
        stats[q.subject].unattempted++;
      } else if (q.isCorrect) {
        stats[q.subject].correct++;
      } else {
        stats[q.subject].incorrect++;
      }
    });
    return stats;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSubject = filterSubject === 'all' || q.subject.toLowerCase() === filterSubject;
      const matchesFilter = !showOnlyIncorrect || (q.isAttempted && !q.isCorrect);
      return matchesSubject && matchesFilter;
    });
  }, [questions, filterSubject, showOnlyIncorrect]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = () => {
    const pct = parseFloat(summary.percentage);
    if (pct >= 80) return 'excellent';
    if (pct >= 60) return 'good';
    if (pct >= 40) return 'average';
    return 'needs-improvement';
  };

  const getSubjectClass = (subject) => {
    switch (subject?.toLowerCase()) {
      case 'physics': return 'physics';
      case 'chemistry': return 'chemistry';
      case 'biology': return 'biology';
      default: return '';
    }
  };

  const getGrade = () => {
    const pct = parseFloat(summary.percentage);
    if (pct >= 90) return { grade: 'A+', message: 'Outstanding performance!' };
    if (pct >= 80) return { grade: 'A', message: 'Excellent work!' };
    if (pct >= 70) return { grade: 'B+', message: 'Very good performance!' };
    if (pct >= 60) return { grade: 'B', message: 'Good effort!' };
    if (pct >= 50) return { grade: 'C', message: 'Keep practicing!' };
    if (pct >= 40) return { grade: 'D', message: 'Needs improvement' };
    return { grade: 'F', message: 'More practice needed' };
  };

  const gradeInfo = getGrade();

  return (
    <div className="results-page">
      {/* Header */}
      <header className="results-header">
        <div className="header-content">
          <motion.div
            className="header-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Test Complete!</h1>
            <p>Here's your detailed performance analysis</p>
          </motion.div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/select')}>
              Take Another Test
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Score Card */}
      <section className="score-section">
        <motion.div
          className={`score-card ${getScoreColor()}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="score-main">
            <div className="score-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="score-bg" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="score-progress"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{
                    strokeDashoffset: 283 - (283 * Math.max(0, parseFloat(summary.percentage)) / 100)
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="score-text">
                <span className="score-value">{summary.score}</span>
                <span className="score-max">/ {summary.maxScore}</span>
              </div>
            </div>
            <div className="score-details">
              <div className="grade-badge">{gradeInfo.grade}</div>
              <p className="grade-message">{gradeInfo.message}</p>
              <p className="score-percentage">{summary.percentage}% accuracy</p>
            </div>
          </div>

          <div className="score-breakdown">
            <div className="breakdown-item correct">
              <div className="breakdown-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.6667 5L7.5 14.1667L3.33334 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-value">{summary.correct}</span>
                <span className="breakdown-label">Correct (+{summary.correct * 4})</span>
              </div>
            </div>
            <div className="breakdown-item incorrect">
              <div className="breakdown-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-value">{summary.incorrect}</span>
                <span className="breakdown-label">Incorrect (-{summary.incorrect})</span>
              </div>
            </div>
            <div className="breakdown-item unattempted">
              <div className="breakdown-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-value">{summary.unattempted}</span>
                <span className="breakdown-label">Unattempted (0)</span>
              </div>
            </div>
            <div className="breakdown-item time">
              <div className="breakdown-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V10L13 13M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="breakdown-info">
                <span className="breakdown-value">{formatTime(summary.timeSpent)}</span>
                <span className="breakdown-label">Time Spent</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Subject-wise Analysis */}
      <section className="analysis-section">
        <h2>Subject-wise Performance</h2>
        <div className="subject-cards">
          {Object.entries(subjectStats).map(([subject, stats], index) => (
            <motion.div
              key={subject}
              className={`subject-stat-card subject-${getSubjectClass(subject)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="subject-stat-header">
                <h3>{subject}</h3>
                <span className="subject-accuracy">
                  {stats.total > 0
                    ? Math.round((stats.correct / stats.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="subject-progress-bar">
                <div
                  className="progress-fill correct"
                  style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                />
                <div
                  className="progress-fill incorrect"
                  style={{ width: `${(stats.incorrect / stats.total) * 100}%` }}
                />
              </div>
              <div className="subject-stat-details">
                <span className="detail correct">{stats.correct} correct</span>
                <span className="detail incorrect">{stats.incorrect} wrong</span>
                <span className="detail unattempted">{stats.unattempted} skipped</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Questions Review */}
      <section className="review-section">
        <div className="review-header">
          <h2>Question Review</h2>
          <div className="review-filters">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showOnlyIncorrect}
                onChange={(e) => setShowOnlyIncorrect(e.target.checked)}
              />
              Show incorrect only
            </label>
          </div>
        </div>

        <div className="questions-list">
          <AnimatePresence>
            {filteredQuestions.map((q, idx) => (
              <motion.div
                key={q.id}
                className={`review-question ${q.isAttempted ? (q.isCorrect ? 'correct' : 'incorrect') : 'unattempted'} subject-${getSubjectClass(q.subject)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <div
                  className="question-summary"
                  onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                >
                  <div className="question-status">
                    {q.isAttempted ? (
                      q.isCorrect ? (
                        <span className="status-icon correct">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      ) : (
                        <span className="status-icon incorrect">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )
                    ) : (
                      <span className="status-icon unattempted">—</span>
                    )}
                  </div>
                  <div className="question-preview">
                    <span className="question-number">Q{questions.indexOf(q) + 1}</span>
                    <span className="question-text-preview">
                      {q.question.length > 100 ? q.question.substring(0, 100) + '...' : q.question}
                    </span>
                  </div>
                  <div className="question-meta-small">
                    <span className="subject-tag">{q.subject}</span>
                    <svg
                      className={`expand-icon ${expandedQuestion === q.id ? 'expanded' : ''}`}
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedQuestion === q.id && (
                    <motion.div
                      className="question-expanded"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="expanded-content">
                        <p className="full-question">{q.question}</p>

                        <div className="options-review">
                          {q.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`option-review
                                ${optIdx === q.correct ? 'correct-answer' : ''}
                                ${optIdx === q.userAnswer && optIdx !== q.correct ? 'wrong-answer' : ''}
                                ${optIdx === q.userAnswer && optIdx === q.correct ? 'user-correct' : ''}
                              `}
                            >
                              <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                              <span className="option-text">{option}</span>
                              {optIdx === q.correct && (
                                <span className="option-tag correct">Correct</span>
                              )}
                              {optIdx === q.userAnswer && optIdx !== q.correct && (
                                <span className="option-tag wrong">Your Answer</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.explanation && (
                          <div className="explanation">
                            <h4>Explanation</h4>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredQuestions.length === 0 && (
            <div className="no-questions">
              <p>No questions match your filter criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Results;
