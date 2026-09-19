import api from './api';

export const enquiryService = {
  createEnquiry: async (enquiryData) => {
    const response = await api.post('/enquiries', enquiryData);
    return response.data;
  },

  getTenantEnquiries: async () => {
    const response = await api.get('/enquiries/tenant');
    return response.data;
  },

  getOwnerEnquiries: async () => {
    const response = await api.get('/enquiries/owner');
    return response.data;
  },

  updateEnquiryStatus: async (id, updateData) => {
    const response = await api.put(`/enquiries/${id}`, updateData);
    return response.data;
  },
};
