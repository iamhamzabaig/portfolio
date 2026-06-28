import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectBySlug } from '../../../utils/fallbackData.js';
import { createProject, deleteProject, fetchProject, fetchProjects, updateProject } from './projects.api.js';

// No placeholderData: with it, `data` is always defined so the loading state
// never surfaces and the UI flashes the static sample projects before the real
// ones land. Without it, isLoading/isPending is real -> the Spinner shows while
// fetching. Genuine empty/error still falls back to samples at the component.
export function useProjects(params = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params)
  });
}

export function useProject(slug) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => fetchProject(slug),
    enabled: Boolean(slug),
    placeholderData: () => getProjectBySlug(slug)
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });
}
