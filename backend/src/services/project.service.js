import { Project } from '../models/project.model.js';
import { destroyImage } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

export const listProjects = async ({ tag, featured } = {}) => {
  const filter = {};
  if (tag) filter.tags = tag;
  if (featured !== undefined) filter.featured = featured === 'true' || featured === true;
  return Project.find(filter).sort({ order: 1, createdAt: -1 });
};

export const getProjectBySlug = async (slug) => {
  const project = await Project.findOne({ slug });
  if (!project) throw new ApiError(404, 'Project not found');
  return project;
};

export const createProject = async (data) => Project.create(data);

export const updateProject = async (id, data) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (data.coverImage?.publicId && project.coverImage?.publicId &&
      data.coverImage.publicId !== project.coverImage.publicId) {
    await destroyImage(project.coverImage.publicId);
  }

  const patch = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  );
  Object.assign(project, patch);
  await project.save();
  return project;
};

export const deleteProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.coverImage?.publicId) await destroyImage(project.coverImage.publicId);
  await project.deleteOne();
};
