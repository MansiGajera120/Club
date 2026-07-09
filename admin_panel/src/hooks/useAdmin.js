import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { adminService } from '@/services/adminService';
import { getApiErrorMessage } from '@/services/apiClient';

/** Dashboard statistics. */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
  });
}

/** Paginated clubs list. `params` = { status?, search?, page, limit }. */
export function useAdminClubs(params) {
  return useQuery({
    queryKey: ['admin', 'clubs', params],
    queryFn: () => adminService.listClubs(params),
    placeholderData: keepPreviousData,
  });
}

/** Paginated users list. */
export function useAdminUsers(params) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.listUsers(params),
    placeholderData: keepPreviousData,
  });
}

/** Paginated events list. */
export function useAdminEvents(params) {
  return useQuery({
    queryKey: ['admin', 'events', params],
    queryFn: () => adminService.listEvents(params),
    placeholderData: keepPreviousData,
  });
}

function invalidateKeys(queryClient, keys) {
  keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
}

export function useUpdateClubStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminService.updateClubStatus(id, body),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'clubs'], ['admin', 'stats']]);
      if (variables.toastMessage) {
        toast.success(variables.toastMessage);
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSetClubFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }) => adminService.setClubFeatured(id, isFeatured),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'clubs'], ['admin', 'stats']]);
      toast.success(
        variables.isFeatured
          ? 'Club added to featured listings'
          : 'Club removed from featured listings'
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.deleteClub(id),
    onSuccess: () => {
      invalidateKeys(qc, [['admin', 'clubs'], ['admin', 'stats']]);
      toast.success('Club permanently deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => adminService.setUserStatus(id, status),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'users'], ['admin', 'stats']]);
      toast.success(
        variables.status === 'active'
          ? 'User account enabled'
          : 'User account disabled'
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.deleteEvent(id),
    onSuccess: () => {
      invalidateKeys(qc, [['admin', 'events'], ['admin', 'stats']]);
      toast.success('Event deleted permanently');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
