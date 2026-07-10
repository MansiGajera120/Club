import { apiClient } from './apiClient';

/** Admin API calls. Each returns plain data unwrapped from the envelope. */
export const adminService = {
  async getStats() {
    const { data } = await apiClient.get('/admin/stats');
    return data.data.stats;
  },

  async listClubs(params) {
    const { data } = await apiClient.get('/admin/clubs', { params });
    return { items: data.data.clubs, meta: data.meta };
  },

  async getClub(id) {
    const { data } = await apiClient.get(`/admin/clubs/${id}`);
    return data.data.club;
  },

  async createClub(body) {
    const { data } = await apiClient.post('/admin/clubs', body);
    return data.data.club;
  },

  async updateClub(id, body) {
    const { data } = await apiClient.patch(`/admin/clubs/${id}`, body);
    return data.data.club;
  },

  async uploadClubLogo(id, file) {
    const form = new FormData();
    form.append('logo', file);
    const { data } = await apiClient.post(`/admin/clubs/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.club;
  },

  async addClubGallery(id, files) {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    const { data } = await apiClient.post(`/admin/clubs/${id}/gallery`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.club;
  },

  async removeClubGallery(id, image) {
    const { data } = await apiClient.delete(`/admin/clubs/${id}/gallery`, {
      data: { image },
    });
    return data.data.club;
  },

  async updateClubStatus(id, body) {
    const { data } = await apiClient.patch(`/admin/clubs/${id}/status`, body);
    return data.data.club;
  },

  async setClubFeatured(id, isFeatured) {
    const { data } = await apiClient.patch(`/admin/clubs/${id}/featured`, {
      isFeatured,
    });
    return data.data.club;
  },

  async deleteClub(id) {
    await apiClient.delete(`/admin/clubs/${id}`);
  },

  async listUsers(params) {
    const { data } = await apiClient.get('/admin/users', { params });
    return { items: data.data.users, meta: data.meta };
  },

  async setUserStatus(id, status) {
    const { data } = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return data.data.user;
  },

  async listEvents(params) {
    const { data } = await apiClient.get('/admin/events', { params });
    return { items: data.data.events, meta: data.meta };
  },

  async deleteEvent(id) {
    await apiClient.delete(`/admin/events/${id}`);
  },
};

export default adminService;
