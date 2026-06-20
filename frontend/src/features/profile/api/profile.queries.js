import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fallbackProfile } from '../../../utils/fallbackData.js';
import { fetchProfile, updateProfile } from './profile.api.js';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    placeholderData: fallbackProfile
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });
}
