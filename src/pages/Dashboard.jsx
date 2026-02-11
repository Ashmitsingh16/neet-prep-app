import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getTestHistory } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/dashboard' } });
    }
  }, [user, authLoading, navigate]);

  // Fetch test history
  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await getTestHistory(pagination.page);
        setHistory(data.history);
        setPagination(data.pagination);
      } catch {
        setError('Failed to load test history. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user, pagination.page]);

  const loadPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Compute stats from loaded history
  const totalTests = pagination.total;
  const avgScore =
    history.length > 0
      ? (history.reduce((sum, t) => sum + t.percentage, 0) / history.length).toFixed(1)
      : 0;
  const bestScore =
    history.length > 0 ? Math.max(...history.map((t) => t.percentage)).toFixed(1) : 0;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const testTypeLabel = (type) => {
    switch (type) {
      case 'neet': return 'NEET Mock';
      case 'full': return 'Full Test';
      case 'chapter': return 'Chapter Practice';
      case 'adaptive': return 'Adaptive';
      default: return type;
    }
  };

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome */}
        <motion.div
          className="dash-welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Welcome back, <span className="user-highlight">{user.name}</span></h1>
          <p>Track your progress and keep improving.</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="dash-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="dash-stat-card">
            <span className="dash-stat-value">{totalTests}</span>
            <span className="dash-stat-label">Tests Taken</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-value">{avgScore}%</span>
            <span className="dash-stat-label">Avg Score</span>
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-value">{bestScore}%</span>
            <span className="dash-stat-label">Best Score</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="dash-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button className="btn btn-primary" onClick={() => navigate('/select')}>
            Start New Test
          </button>
        </motion.div>

        {/* Test History */}
        <motion.div
          className="dash-history"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2>Test History</h2>

          {error && <div className="dash-error">{error}</div>}

          {loading ? (
            <div className="dash-history-loading">
              <div className="spinner"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="dash-empty">
              <p>No tests taken yet. Start a practice test to see your history here!</p>
            </div>
          ) : (
            <>
              <div className="history-list">
                {history.map((test) => (
                  <div key={test._id} className="history-item">
                    <div className="history-date">{formatDate(test.createdAt)}</div>
                    <div className="history-details">
                      <span className="history-type">{testTypeLabel(test.testType)}</span>
                      <span className="history-score">
                        {test.score}/{test.maxScore}
                      </span>
                      <span
                        className={`history-pct ${
                          test.percentage >= 70
                            ? 'good'
                            : test.percentage >= 40
                            ? 'mid'
                            : 'low'
                        }`}
                      >
                        {test.percentage}%
                      </span>
                      <span className="history-qs">
                        {test.correct}/{test.totalQuestions} correct
                      </span>
                      <span className="history-time">{formatTime(test.timeTaken)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="dash-pagination">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => loadPage(pagination.page - 1)}
                  >
                    Prev
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => loadPage(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
