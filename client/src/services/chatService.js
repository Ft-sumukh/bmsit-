import api from './api';

/**
 * Send question message, triggers semantic context retrieval, gets response
 */
export const askDocumentQuestion = async (documentId, message) => {
  const { data } = await api.post(`/chat/${documentId}`, { message });
  return data;
};

/**
 * Retrieve chat logs stream for a specific document
 */
export const getChatHistory = async (documentId) => {
  const { data } = await api.get(`/chat/${documentId}/history`);
  return data;
};

/**
 * Clear all chat messages stream for a specific document
 */
export const clearChatHistory = async (documentId) => {
  const { data } = await api.delete(`/chat/${documentId}/history`);
  return data;
};

/**
 * Explain a technical topic inside document bounds simply (16-year-old style)
 */
export const simplifyTopic = async (topic, documentId = null) => {
  const { data } = await api.post('/chat/simplify', { topic, documentId });
  return data;
};
