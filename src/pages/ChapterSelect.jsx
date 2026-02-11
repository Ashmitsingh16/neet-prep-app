import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { subjects, getAllChapters, NEET_CONFIG } from '../data/questions';
import './ChapterSelect.css';

const ChapterSelect = ({ setTestConfig }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFullMock = searchParams.get('mode') === 'full';

  const [selectedChapters, setSelectedChapters] = useState([]);
  const [activeSubject, setActiveSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allChapters = useMemo(() => getAllChapters(), []);

  const filteredChapters = useMemo(() => {
    return allChapters.filter(chapter => {
      const matchesSubject = activeSubject === 'all' ||
        chapter.subject.toLowerCase() === activeSubject;
      const matchesSearch = chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSubject && matchesSearch;
    });
  }, [allChapters, activeSubject, searchQuery]);

  const groupedChapters = useMemo(() => {
    const groups = {};
    filteredChapters.forEach(chapter => {
      if (!groups[chapter.subject]) {
        groups[chapter.subject] = [];
      }
      groups[chapter.subject].push(chapter);
    });
    return groups;
  }, [filteredChapters]);

  const toggleChapter = (chapterId) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const selectAllInSubject = (subjectName) => {
    const subjectChapters = allChapters
      .filter(c => c.subject === subjectName)
      .map(c => c.id);

    const allSelected = subjectChapters.every(id => selectedChapters.includes(id));

    if (allSelected) {
      setSelectedChapters(prev => prev.filter(id => !subjectChapters.includes(id)));
    } else {
      setSelectedChapters(prev => [...new Set([...prev, ...subjectChapters])]);
    }
  };

  const selectAll = () => {
    if (selectedChapters.length === allChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(allChapters.map(c => c.id));
    }
  };

  const totalQuestions = useMemo(() => {
    return allChapters
      .filter(c => selectedChapters.includes(c.id))
      .reduce((sum, c) => sum + c.questionCount, 0);
  }, [selectedChapters, allChapters]);

  const startTest = () => {
    if (selectedChapters.length === 0 && !isFullMock) return;

    const config = isFullMock
      ? { mode: 'full', chapters: allChapters.map(c => c.id) }
      : { mode: 'custom', chapters: selectedChapters };

    setTestConfig(config);
    navigate('/test');
  };

  const getSubjectColor = (subject) => {
    switch (subject.toLowerCase()) {
      case 'physics': return 'physics';
      case 'chemistry': return 'chemistry';
      case 'biology': return 'biology';
      default: return '';
    }
  };

  return (
    <div className="chapter-select">
      {/* Header */}
      <header className="select-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="header-title">
          <h1>{isFullMock ? 'Full Mock Test' : 'Select Chapters'}</h1>
          <p>
            {isFullMock
              ? 'Complete mock test covering all chapters'
              : 'Choose chapters to create your personalized mock test'}
          </p>
        </div>
      </header>

      {/* Full NEET Mock Test Card */}
      {!isFullMock && (
        <motion.div
          className="neet-mock-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mock-banner-content">
            <div className="mock-banner-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M24 12V24L32 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="mock-banner-text">
              <h2>Full NEET Mock Test</h2>
              <p>Experience the real NEET exam with proper timing and scoring</p>
              <div className="mock-banner-stats">
                <span><strong>{NEET_CONFIG.duration} mins</strong> Duration</span>
                <span><strong>{NEET_CONFIG.totalQuestions}</strong> Questions</span>
                <span><strong>{NEET_CONFIG.totalMarks}</strong> Marks</span>
                <span><strong>+{NEET_CONFIG.marksPerCorrect}/{NEET_CONFIG.marksPerWrong}</strong> Marking</span>
              </div>
              <div className="mock-banner-subjects">
                <span className="subject-pill physics">Physics: {NEET_CONFIG.physics} Qs</span>
                <span className="subject-pill chemistry">Chemistry: {NEET_CONFIG.chemistry} Qs</span>
                <span className="subject-pill biology">Biology: {NEET_CONFIG.biology} Qs</span>
              </div>
            </div>
            <motion.button
              className="btn btn-primary mock-banner-btn"
              onClick={() => {
                setTestConfig({ mode: 'neet', chapters: allChapters.map(c => c.id) });
                navigate('/test');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start NEET Mock
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="select-content">
        {/* Sidebar */}
        <aside className="select-sidebar">
          <div className="sidebar-section">
            <h3>Filter by Subject</h3>
            <div className="subject-filters">
              <button
                className={`filter-btn ${activeSubject === 'all' ? 'active' : ''}`}
                onClick={() => setActiveSubject('all')}
              >
                All Subjects
              </button>
              {Object.entries(subjects).map(([key, subject]) => (
                <button
                  key={key}
                  className={`filter-btn subject-${getSubjectColor(subject.name)} ${activeSubject === subject.name.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setActiveSubject(subject.name.toLowerCase())}
                >
                  <span className="filter-icon">{subject.icon}</span>
                  {subject.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Search</h3>
            <div className="search-box">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M16.5 16.5L12.875 12.875M14.8333 8.16667C14.8333 11.8486 11.8486 14.8333 8.16667 14.8333C4.48477 14.8333 1.5 11.8486 1.5 8.16667C1.5 4.48477 4.48477 1.5 8.16667 1.5C11.8486 1.5 14.8333 4.48477 14.8333 8.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search chapters or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <button className="action-btn" onClick={selectAll}>
              {selectedChapters.length === allChapters.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Selection Summary */}
          <div className="selection-summary">
            <div className="summary-stat">
              <span className="summary-value">{selectedChapters.length}</span>
              <span className="summary-label">Chapters Selected</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{totalQuestions}</span>
              <span className="summary-label">Total Questions</span>
            </div>
            <motion.button
              className="btn btn-primary start-btn"
              onClick={startTest}
              disabled={selectedChapters.length === 0 && !isFullMock}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isFullMock ? 'Start Full Mock' : 'Start Test'}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.75 9H14.25M14.25 9L9 3.75M14.25 9L9 14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        </aside>

        {/* Chapter Grid */}
        <main className="chapters-main">
          <AnimatePresence mode="wait">
            {Object.entries(groupedChapters).map(([subjectName, chapters]) => (
              <motion.div
                key={subjectName}
                className={`subject-group subject-${getSubjectColor(subjectName)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="subject-header">
                  <div className="subject-info">
                    <h2>{subjectName}</h2>
                    <span className="chapter-count">{chapters.length} chapters</span>
                  </div>
                  <button
                    className="select-subject-btn"
                    onClick={() => selectAllInSubject(subjectName)}
                  >
                    {chapters.every(c => selectedChapters.includes(c.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="chapters-grid">
                  {chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter.id}
                      className={`chapter-card ${selectedChapters.includes(chapter.id) ? 'selected' : ''}`}
                      onClick={() => toggleChapter(chapter.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="chapter-checkbox">
                        <div className="checkbox">
                          {selectedChapters.includes(chapter.id) && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M11.6667 3.5L5.25 9.91667L2.33334 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="chapter-content">
                        <h3>{chapter.name}</h3>
                        <div className="chapter-topics">
                          {chapter.topics.slice(0, 3).map(topic => (
                            <span key={topic} className="topic-tag">{topic}</span>
                          ))}
                          {chapter.topics.length > 3 && (
                            <span className="topic-more">+{chapter.topics.length - 3}</span>
                          )}
                        </div>
                      </div>

                      <div className="chapter-meta">
                        <span className="question-count">
                          {chapter.questionCount} Qs
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredChapters.length === 0 && (
            <div className="no-results">
              <p>No chapters found matching your criteria</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChapterSelect;
