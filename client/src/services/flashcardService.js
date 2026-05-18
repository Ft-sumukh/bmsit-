import api from './api';

/**
 * Generate a new study flashcard deck from parsed document text
 */
export const generateFlashcards = async (documentId, count = 6) => {
  const { data } = await api.post(`/flashcards/generate/${documentId}`, { count });
  return data;
};

/**
 * Fetch all flashcard decks generated for the student
 */
export const getUserFlashcards = async () => {
  const { data } = await api.get('/flashcards');
  return data;
};

/**
 * Toggle mastery status for a specific flashcard in a deck
 */
export const updateCardMastery = async (deckId, cardId, mastered) => {
  const { data } = await api.patch(`/flashcards/${deckId}/card/${cardId}`, { mastered });
  return data;
};

/**
 * Delete a specific flashcard deck
 */
export const deleteFlashcardDeck = async (deckId) => {
  const { data } = await api.delete(`/flashcards/${deckId}`);
  return data;
};
