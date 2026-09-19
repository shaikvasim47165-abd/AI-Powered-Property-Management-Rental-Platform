import api from './api';

export const shortlistService = {
  getShortlists: async () => {
    const response = await api.get('/shortlists');
    return response.data;
  },

  addShortlist: async (propertyId) => {
    const response = await api.post('/shortlists', { propertyId });
    return response.data;
  },

  removeShortlist: async (propertyId) => {
    const response = await api.delete(`/shortlists/${propertyId}`);
    return response.data;
  },
};
