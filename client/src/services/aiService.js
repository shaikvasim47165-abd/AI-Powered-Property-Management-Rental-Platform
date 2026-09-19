import api from './api';

export const aiService = {
  searchAI: async (query) => {
    const response = await api.post('/api/ai/search', { query });
    return response.data;
  },

  askPropertyQuestion: async (propertyId, question) => {
    const response = await api.post('/api/ai/property-question', {
      propertyId,
      question,
    });
    return response.data;
  },
};
