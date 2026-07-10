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

  /** Invite a new admin by email (they set their password via the reset flow). */
  async createAdmin(email) {
    await apiClient.post('/admin/admins', { email });
  },

  async setUserStatus(id, status) {
    const { data } = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return data.data.user;
  },

  async listEvents(params) {
    const { data } = await apiClient.get('/admin/events', { params });
    return { items: data.data.events, meta: data.meta };
  },

  async getEvent(id) {
    const { data } = await apiClient.get(`/events/${id}`);
    return data.data.event;
  },

  async createEvent(body) {
    const { data } = await apiClient.post('/events', body);
    return data.data.event;
  },

  async updateEvent(id, body) {
    const { data } = await apiClient.patch(`/events/${id}`, body);
    return data.data.event;
  },

  async uploadEventCover(id, file) {
    const form = new FormData();
    form.append('cover', file);
    const { data } = await apiClient.post(`/events/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.event;
  },

  async deleteEvent(id) {
    await apiClient.delete(`/admin/events/${id}`);
  },
};

export default adminService;
