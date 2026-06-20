import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMessage, fetchMessages, submitContact } from './contact.api.js';

export function useSubmitContact() {
  return useMutation({ mutationFn: submitContact });
}

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: fetchMessages,
    placeholderData: []
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] })
  });
}
