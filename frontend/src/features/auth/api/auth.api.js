import { axiosClient } from '../../../api/axiosClient.js';

export async function loginRequest(credentials) {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data.data.user;
}

export async function logoutRequest() {
  const response = await axiosClient.post('/auth/logout');
  return response.data.data;
}

export async function fetchMe() {
  const response = await axiosClient.get('/auth/me');
  return response.data.data;
}
