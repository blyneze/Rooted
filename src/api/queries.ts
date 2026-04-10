import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from './apiClient';

export function useHomeFeed() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['homeFeed'],
    queryFn: async () => {
      const { data } = await api.get('/content/home');
      return data;
    },
  });
}

export function useMessages(searchQuery?: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['messages', searchQuery],
    queryFn: async () => {
      const { data } = await api.get('/content/messages', {
        params: { q: searchQuery },
      });
      return data;
    },
  });
}

export function useMessage(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['message', id],
    queryFn: async () => {
      const { data } = await api.get(`/content/messages/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSeries() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const { data } = await api.get('/content/series');
      return data;
    },
  });
}

export function useBooks() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data } = await api.get('/content/books');
      return data;
    },
  });
}
export function useBook(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const { data } = await api.get(`/content/books/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useSeriesById(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['series', id],
    queryFn: async () => {
      const { data } = await api.get(`/content/series/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useBibleBooks() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['bible', 'books'],
    queryFn: async () => {
      const { data } = await api.get('/bible/books');
      return data;
    },
  });
}

export function useBibleChapter(bookId: string, chapterId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['bible', 'chapter', bookId, chapterId],
    queryFn: async () => {
      const { data } = await api.get(`/bible/${bookId}/${chapterId}`);
      return data;
    },
    enabled: !!bookId && !!chapterId,
  });
}

export function usePlaybackProgress() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['me', 'progress'],
    queryFn: async () => {
      const { data } = await api.get('/me/progress');
      return data;
    },
  });
}

export function useUpdatePlaybackProgress() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { messageId: string; position: number; progress: number; isCompleted: boolean }) => {
      const { data } = await api.post('/me/progress', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'progress'] });
    },
  });
}

export function useSavedItems() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['me', 'saved'],
    queryFn: async () => {
      const { data } = await api.get('/me/saved');
      return data;
    },
  });
}

export function usePlaylists() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['me', 'playlists'],
    queryFn: async () => {
      const { data } = await api.get('/me/playlists');
      // Map Prisma include structure to our frontend AudioMessage[] structure
      return data.map((pl: any) => ({
        ...pl,
        items: pl.items?.map((item: any) => item.message) || [],
      }));
    },
  });
}

export function usePlaylist(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['me', 'playlists', id],
    queryFn: async () => {
      const { data } = await api.get('/me/playlists');
      const playlist = data.find((p: any) => p.id === id);
      if (!playlist) return null;
      return {
        ...playlist,
        items: playlist.items?.map((item: any) => item.message) || [],
      };
    },
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data } = await api.post('/me/playlists', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
    },
  });
}

export function useDeletePlaylist() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/me/playlists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
    },
  });
}

export function useAddPlaylistItem() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { playlistId: string; messageId: string }) => {
      const { data } = await api.post(`/me/playlists/${payload.playlistId}/items`, {
        messageId: payload.messageId,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists', variables.playlistId] });
    },
  });
}

export function useRemovePlaylistItem() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { playlistId: string; messageId: string }) => {
      await api.delete(`/me/playlists/${payload.playlistId}/items/${payload.messageId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'playlists', variables.playlistId] });
    },
  });
}
