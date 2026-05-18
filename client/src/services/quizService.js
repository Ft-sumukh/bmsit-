import api from './api';

/**
 * Generate a new MCQ study quiz from document text
 */
export const generateQuiz = async (documentId, count = 5, difficulty = 'medium') => {
  const { data } = await api.post(`/quiz/generate/${documentId}`, { count, difficulty });
  return data;
};

/**
 * Fetch all quizzes created by the logged-in student
 */
export const getUserQuizzes = async () => {
  const { data } = await api.get('/quiz');
  return data;
};

/**
 * Get detailed questions and metadata for a specific quiz
 */
export const getQuizById = async (quizId) => {
  const { data } = await api.get(`/quiz/${quizId}`);
  return data;
};

/**
 * Submit selected option answers and get detailed scores + explanations
 */
export const submitAnswers = async (quizId, answers) => {
  const { data } = await api.post(`/quiz/${quizId}/submit`, { answers });
  return data;
};

/**
 * Delete a specific quiz record from history
 */
export const deleteQuiz = async (quizId) => {
  const { data } = await api.delete(`/quiz/${quizId}`);
  return data;
};
