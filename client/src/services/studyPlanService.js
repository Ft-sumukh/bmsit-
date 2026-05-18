import api from './api';

/**
 * Generate a personalized study plan calendar based on topics, exams, and daily limits
 */
export const generateStudyPlan = async (subjects, examDate, hoursPerDay, weakSubjects = '', strongSubjects = '') => {
  const { data } = await api.post('/studyplan/generate', {
    subjects,
    examDate,
    hoursPerDay,
    weakSubjects,
    strongSubjects
  });
  return data;
};

/**
 * Fetch active personalized study timetable for calendar view boards
 */
export const getStudyPlan = async () => {
  const { data } = await api.get('/studyplan');
  return data;
};
