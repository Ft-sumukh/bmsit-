const User = require('../models/User');
const StudySession = require('../models/StudySession');
const aiService = require('../services/aiService');

// @desc    Generate personalized AI study timetable
// @route   POST /api/studyplan/generate
// @access  Private
const generateUserStudyPlan = async (req, res, next) => {
  try {
    const { subjects, examDate, hoursPerDay = 3, weakSubjects = '', strongSubjects = '' } = req.body;

    if (!subjects || !examDate) {
      res.status(400);
      return next(new Error('Please provide at least one subject and your target exam date'));
    }

    // Call AI planner service
    const generatedPlan = await aiService.generateStudyPlan(
      subjects,
      examDate,
      hoursPerDay,
      weakSubjects,
      strongSubjects
    );

    if (!generatedPlan || !generatedPlan.plan) {
      res.status(500);
      return next(new Error('Failed to assemble a practical study calendar.'));
    }

    // Save timetable to User profile in MongoDB
    const user = await User.findById(req.user._id);
    user.studyPlan = {
      subjects,
      examDate,
      hoursPerDay,
      weakSubjects,
      strongSubjects,
      timetable: generatedPlan.plan,
      tips: generatedPlan.tips || [],
      generatedAt: new Date()
    };
    await user.save();

    // Log study time: 3 minutes of planning
    await StudySession.create({
      userId: req.user._id,
      sessionType: 'studyplan',
      duration: 3
    });

    res.status(201).json(user.studyPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's study timetable
// @route   GET /api/studyplan
// @access  Private
const getUserStudyPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('studyPlan');
    res.json(user.studyPlan || { timetable: [], tips: [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateUserStudyPlan,
  getUserStudyPlan
};
