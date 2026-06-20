import { axiosClient } from '../../../api/axiosClient.js';

export async function fetchProjects(params = {}) {
  const response = await axiosClient.get('/projects', { params });
  return response.data.data;
}

export async function fetchProject(slug) {
  const response = await axiosClient.get(`/projects/${slug}`);
  return response.data.data;
}

export async function createProject(formData) {
  const response = await axiosClient.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
}

export async function updateProject({ id, formData }) {
  const response = await axiosClient.put(`/projects/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
}

export async function deleteProject(id) {
  const response = await axiosClient.delete(`/projects/${id}`);
  return response.data.data;
}
