import {
  listProjects, getProjectBySlug, createProject, updateProject, deleteProject,
} from '../services/project.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const coverFromFile = (file) =>
  file ? { coverImage: { url: file.path, publicId: file.filename } } : {};

export const projectController = {
  list: asyncHandler(async (req, res) => {
    const data = await listProjects(req.query);
    res.status(200).json(new ApiResponse(200, data));
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const data = await getProjectBySlug(req.params.slug);
    res.status(200).json(new ApiResponse(200, data));
  }),

  create: asyncHandler(async (req, res) => {
    const data = await createProject({ ...req.body, ...coverFromFile(req.file) });
    res.status(201).json(new ApiResponse(201, data, 'Project created'));
  }),

  update: asyncHandler(async (req, res) => {
    const data = await updateProject(req.params.id, { ...req.body, ...coverFromFile(req.file) });
    res.status(200).json(new ApiResponse(200, data, 'Project updated'));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteProject(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Project deleted'));
  }),
};
