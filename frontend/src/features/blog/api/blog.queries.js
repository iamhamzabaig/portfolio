import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPostBySlug } from '../../../utils/fallbackData.js';
import { createPost, deletePost, fetchPost, fetchPosts, updatePost } from './blog.api.js';

// No placeholderData on the list (same reasoning as projects): keep isLoading
// honest so the Spinner shows while fetching; empty/error falls back to samples
// at the component.
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });
}

export function usePost(slug) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPost(slug),
    enabled: Boolean(slug),
    placeholderData: () => getPostBySlug(slug)
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });
}
