import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📖',
      title: 'Chapter-wise PYQs',
      description: 'Practice previous year questions organized by chapters across Physics, Chemistry, and Biology'
    },
    {
      icon: '🎯',
      title: 'Custom Mock Tests',
      description: 'Select specific chapters and create personalized mock tests tailored to your preparation needs'
    },
    {
      icon: '📊',
      title: 'Detailed Analytics',
      description: 'Get comprehensive performance reports with explanations for every question'
    },
    {
      icon: '⏱️',
      title: 'Timed Practice',
      description: 'Simulate real NEET exam conditions with accurate timing for each mock test'
    }
  ];

  const stats = [
    { value: '1500+', label: 'PYQ Questions' },
    { value: '65+', label: 'Chapters' },
    { value: '100%', label: 'Free Access' },
    { value: '2015-2024', label: 'Year Coverage' }
  ];

  return (
    <div className="home">
      {/* Decorative elements */}
      <div className="home-decoration">
        <div className="deco-circle deco-1"></div>
        <div className="deco-circle deco-2"></div>
        <div className="deco-circle deco-3"></div>
        <div className="deco-line deco-line-1"></div>
        <div className="deco-line deco-line-2"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">
            <span className="badge-icon">🔬</span>
            <span>NEET 2025 Preparation</span>
          </div>

          <h1 className="hero-title">
            Master Your
            <span className="title-accent"> NEET </span>
            Preparation
          </h1>

          <p className="hero-subtitle">
            A comprehensive platform with chapter-wise previous year questions,
            customizable mock tests, and detailed performance analytics to help
            you crack NEET with confidence.
          </p>

          <div className="hero-actions">
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/select')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Practice</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>

            <motion.button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/select?mode=full')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Full NEET Mock</span>
              <span className="mock-info">3 hrs | 180 Qs | 720 marks</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="visual-card">
            <div className="subject-icons">
              <div className="subject-icon physics">
                <span>⚛</span>
                <label>Physics</label>
              </div>
              <div className="subject-icon chemistry">
                <span>🧪</span>
                <label>Chemistry</label>
              </div>
              <div className="subject-icon biology">
                <span>🧬</span>
                <label>Biology</label>
              </div>
            </div>
            <div className="visual-stats">
              <div className="stat-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="ring-bg" />
                  <circle cx="50" cy="50" r="45" className="ring-progress" />
                </svg>
                <div className="stat-text">
                  <span className="stat-value">720</span>
                  <span className="stat-label">Target Score</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2>Why Choose NEETPrepPro?</h2>
          <p>Everything you need to ace the NEET examination</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Start Your NEET Journey?</h2>
          <p>Begin with chapter-wise practice or take a full mock test</p>
          <div className="cta-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/select')}>
              Get Started Now
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/select?mode=full')}>
              Take Full Mock Test
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-icon">🔬</span>
            <span className="brand-name">NEETPrepPro</span>
          </div>
          <p className="footer-text">
            Built for NEET aspirants. Practice smarter, score higher.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
