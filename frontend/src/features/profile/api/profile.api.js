import { axiosClient } from '../../../api/axiosClient.js';

export async function fetchProfile() {
  const response = await axiosClient.get('/profile');
  return response.data.data;
}

export async function updateProfile(payload) {
  const response = await axiosClient.put('/profile', payload);
  return response.data.data;
}
