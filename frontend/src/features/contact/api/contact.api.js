import { axiosClient } from '../../../api/axiosClient.js';

export async function submitContact(payload) {
  const response = await axiosClient.post('/contact', payload);
  return response.data.data;
}

export async function fetchMessages() {
  const response = await axiosClient.get('/contact');
  return response.data.data;
}

export async function deleteMessage(id) {
  const response = await axiosClient.delete(`/contact/${id}`);
  return response.data.data;
}
