import api from './api';

/**
 * Generate structural notes summaries from document text (lazy cached)
 */
export const generateSummary = async (documentId) => {
  const { data } = await api.post(`/summary/generate/${documentId}`);
  return data;
};

/**
 * Fetch already generated summary of a specific document
 */
export const getSummary = async (documentId) => {
  const { data } = await api.get(`/summary/${documentId}`);
  return data;
};
