const Document = require('../models/Document');
const StudySession = require('../models/StudySession');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');

// @desc    Retrieve structured student progress analytics for dashboard charts
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Total documents uploaded
    const totalDocs = await Document.countDocuments({ userId });

    // 2. Retrieve all student sessions
    const sessions = await StudySession.find({ userId });
    const totalSessions = sessions.length;
    
    // Sum active hours (rounded to 1 decimal place)
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // 3. Average Quiz Score percentage
    const quizzes = await Quiz.find({ userId });
    let totalScorePercent = 0;
    const quizCount = quizzes.length;

    quizzes.forEach(q => {
      const qScore = q.score || 0;
      const qTotal = q.questions ? q.questions.length : 1;
      totalScorePercent += (qScore / (qTotal || 1)) * 100;
    });

    const avgQuizScore = quizCount > 0 ? Math.round(totalScorePercent / quizCount) : 0;

    // 4. Flashcard mastery metrics
    const decks = await Flashcard.find({ userId });
    let totalCards = 0;
    let masteredCards = 0;

    decks.forEach(d => {
      if (d.cards && Array.isArray(d.cards)) {
        totalCards += d.cards.length;
        masteredCards += d.cards.filter(c => c.mastered).length;
      }
    });

    // 5. Weekly study logs (last 7 days grouped for charts)
    const weeklyLogs = [];
    const dateToday = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(dateToday.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];

      // Filter sessions for this specific date
      const daySessions = sessions.filter(s => {
        const sDateStr = new Date(s.date).toISOString().split('T')[0];
        return sDateStr === dateStr;
      });

      const dayDuration = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);

      weeklyLogs.push({
        date: dateStr,
        day: dayName,
        minutes: dayDuration
      });
    }

    // 6. Advanced consecutive active study days streak calculator
    let streak = 0;
    const studyDates = new Set(
      sessions.map(s => new Date(s.date).toISOString().split('T')[0])
    );
    const checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (studyDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If streak is currently 0, check if student studied yesterday
        // allowing streak maintenance if today's study block hasn't started
        if (streak === 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (studyDates.has(yesterdayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue; // Keep checking backwards from yesterday
          }
        }
        break;
      }
    }

    res.json({
      totalDocs,
      totalSessions,
      totalHours,
      avgQuizScore,
      flashcards: {
        total: totalCards,
        mastered: masteredCards,
        pending: totalCards - masteredCards
      },
      weeklyLogs,
      streak
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
