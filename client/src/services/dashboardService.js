import api from './api';

/**
 * Fetch consolidated dashboard metrics, streaks, logs, and progress scopes
 */
export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};
