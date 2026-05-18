import api from './api';

/**
 * Upload a PDF study document with live upload progress tracking
 */
export const uploadDocument = async (file, title, subject, tags, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  if (subject) formData.append('subject', subject);
  if (tags) formData.append('tags', tags);

  const { data } = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // Triggers callback for file progress bars
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    }
  });

  return data;
};

/**
 * List all documents uploaded by the student
 */
export const getDocuments = async () => {
  const { data } = await api.get('/documents');
  return data;
};

/**
 * Retrieve metadata and contents for a specific PDF document
 */
export const getDocumentById = async (id) => {
  const { data } = await api.get(`/documents/${id}`);
  return data;
};

/**
 * Delete document metadata from MongoDB and physical copy from backend disk
 */
export const deleteDocument = async (id) => {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
};
