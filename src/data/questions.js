// Comprehensive NEET PYQ Database - 1500+ Questions
// Importing from subject-specific files

import { physicsChapters } from './physics';
import { chemistryChapters } from './chemistry';
import { biologyChapters } from './biology';

export const subjects = {
  physics: {
    name: "Physics",
    icon: "⚛",
    chapters: physicsChapters
  },
  chemistry: {
    name: "Chemistry",
    icon: "🧪",
    chapters: chemistryChapters
  },
  biology: {
    name: "Biology",
    icon: "🧬",
    chapters: biologyChapters
  }
};

// NEET Exam Configuration
export const NEET_CONFIG = {
  totalQuestions: 180,
  physics: 45,
  chemistry: 45,
  biology: 90, // 45 Botany + 45 Zoology
  duration: 180, // 3 hours in minutes
  marksPerCorrect: 4,
  marksPerWrong: -1,
  marksPerUnanswered: 0,
  totalMarks: 720
};

// Helper function to get all questions for selected chapters (PRACTICE MODE)
export const getQuestionsForChapters = (selectedChapters) => {
  const questions = [];

  Object.entries(subjects).forEach(([subjectKey, subject]) => {
    Object.entries(subject.chapters).forEach(([chapterKey, chapter]) => {
      const chapterId = `${subjectKey}_${chapterKey}`;
      if (selectedChapters.includes(chapterId)) {
        chapter.questions.forEach((q) => {
          questions.push({
            ...q,
            subject: subject.name,
            chapter: chapter.name,
            chapterId: chapterId
          });
        });
      }
    });
  });

  // Shuffle questions
  return questions.sort(() => Math.random() - 0.5);
};

// Get all chapters with their info
export const getAllChapters = () => {
  const chapters = [];

  Object.entries(subjects).forEach(([subjectKey, subject]) => {
    Object.entries(subject.chapters).forEach(([chapterKey, chapter]) => {
      chapters.push({
        id: `${subjectKey}_${chapterKey}`,
        name: chapter.name,
        subject: subject.name,
        subjectKey: subjectKey,
        subjectIcon: subject.icon,
        topics: chapter.topics,
        questionCount: chapter.questions.length
      });
    });
  });

  return chapters;
};

// Get questions for a FULL NEET Mock Test (180 questions with proper distribution)
export const getFullNEETMockQuestions = () => {
  const allPhysicsQuestions = [];
  const allChemistryQuestions = [];
  const allBiologyQuestions = [];

  // Collect ALL questions by subject
  Object.values(physicsChapters).forEach(chapter => {
    chapter.questions.forEach((q) => {
      allPhysicsQuestions.push({
        ...q,
        subject: "Physics",
        chapter: chapter.name
      });
    });
  });

  Object.values(chemistryChapters).forEach(chapter => {
    chapter.questions.forEach((q) => {
      allChemistryQuestions.push({
        ...q,
        subject: "Chemistry",
        chapter: chapter.name
      });
    });
  });

  Object.values(biologyChapters).forEach(chapter => {
    chapter.questions.forEach((q) => {
      allBiologyQuestions.push({
        ...q,
        subject: "Biology",
        chapter: chapter.name
      });
    });
  });

  // Shuffle each subject's questions
  const shuffledPhysics = allPhysicsQuestions.sort(() => Math.random() - 0.5);
  const shuffledChemistry = allChemistryQuestions.sort(() => Math.random() - 0.5);
  const shuffledBiology = allBiologyQuestions.sort(() => Math.random() - 0.5);

  // Select required number from each subject
  const selectedPhysics = shuffledPhysics.slice(0, Math.min(NEET_CONFIG.physics, shuffledPhysics.length));
  const selectedChemistry = shuffledChemistry.slice(0, Math.min(NEET_CONFIG.chemistry, shuffledChemistry.length));
  const selectedBiology = shuffledBiology.slice(0, Math.min(NEET_CONFIG.biology, shuffledBiology.length));

  // Combine in NEET order: Physics -> Chemistry -> Biology
  const neetQuestions = [
    ...selectedPhysics.map((q, i) => ({ ...q, questionNumber: i + 1 })),
    ...selectedChemistry.map((q, i) => ({ ...q, questionNumber: NEET_CONFIG.physics + i + 1 })),
    ...selectedBiology.map((q, i) => ({ ...q, questionNumber: NEET_CONFIG.physics + NEET_CONFIG.chemistry + i + 1 }))
  ];

  return neetQuestions;
};

// Get questions for a custom mock test (with limit)
export const getFullMockQuestions = (count = 180) => {
  const allQuestions = [];

  Object.values(subjects).forEach(subject => {
    Object.values(subject.chapters).forEach(chapter => {
      chapter.questions.forEach(q => {
        allQuestions.push({
          ...q,
          subject: subject.name,
          chapter: chapter.name
        });
      });
    });
  });

  // Shuffle and return requested number
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Get total question count
export const getTotalQuestionCount = () => {
  let count = 0;
  Object.values(subjects).forEach(subject => {
    Object.values(subject.chapters).forEach(chapter => {
      count += chapter.questions.length;
    });
  });
  return count;
};

// Get subject-wise question count
export const getSubjectWiseCount = () => {
  const counts = {};
  Object.entries(subjects).forEach(([key, subject]) => {
    counts[subject.name] = 0;
    Object.values(subject.chapters).forEach(chapter => {
      counts[subject.name] += chapter.questions.length;
    });
  });
  return counts;
};

// Get chapter-wise question count for a subject
export const getChapterWiseCount = (subjectKey) => {
  const counts = [];
  const subject = subjects[subjectKey];
  if (subject) {
    Object.entries(subject.chapters).forEach(([chapterKey, chapter]) => {
      counts.push({
        id: `${subjectKey}_${chapterKey}`,
        name: chapter.name,
        count: chapter.questions.length
      });
    });
  }
  return counts;
};

// Get questions by year
export const getQuestionsByYear = (year) => {
  const questions = [];
  Object.values(subjects).forEach(subject => {
    Object.values(subject.chapters).forEach(chapter => {
      chapter.questions.forEach(q => {
        if (q.year === year) {
          questions.push({
            ...q,
            subject: subject.name,
            chapter: chapter.name
          });
        }
      });
    });
  });
  return questions.sort(() => Math.random() - 0.5);
};

// Calculate NEET score
export const calculateNEETScore = (answers, questions) => {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  questions.forEach((q, index) => {
    const userAnswer = answers[index];
    if (userAnswer === undefined || userAnswer === null) {
      unanswered++;
    } else if (userAnswer === q.correct) {
      correct++;
    } else {
      wrong++;
    }
  });

  const score = (correct * NEET_CONFIG.marksPerCorrect) + (wrong * NEET_CONFIG.marksPerWrong);

  return {
    correct,
    wrong,
    unanswered,
    score: Math.max(0, score), // Score can't be negative
    totalQuestions: questions.length,
    maxScore: questions.length * NEET_CONFIG.marksPerCorrect,
    percentage: ((correct / questions.length) * 100).toFixed(1),
    accuracy: questions.length - unanswered > 0
      ? ((correct / (questions.length - unanswered)) * 100).toFixed(1)
      : 0
  };
};

// Get subject-wise performance
export const getSubjectWisePerformance = (answers, questions) => {
  const performance = {
    Physics: { correct: 0, wrong: 0, unanswered: 0, total: 0 },
    Chemistry: { correct: 0, wrong: 0, unanswered: 0, total: 0 },
    Biology: { correct: 0, wrong: 0, unanswered: 0, total: 0 }
  };

  questions.forEach((q, index) => {
    const subject = q.subject;
    if (performance[subject]) {
      performance[subject].total++;
      const userAnswer = answers[index];
      if (userAnswer === undefined || userAnswer === null) {
        performance[subject].unanswered++;
      } else if (userAnswer === q.correct) {
        performance[subject].correct++;
      } else {
        performance[subject].wrong++;
      }
    }
  });

  // Calculate scores for each subject
  Object.keys(performance).forEach(subject => {
    const p = performance[subject];
    p.score = (p.correct * NEET_CONFIG.marksPerCorrect) + (p.wrong * NEET_CONFIG.marksPerWrong);
    p.maxScore = p.total * NEET_CONFIG.marksPerCorrect;
    p.percentage = p.total > 0 ? ((p.correct / p.total) * 100).toFixed(1) : 0;
  });

  return performance;
};
