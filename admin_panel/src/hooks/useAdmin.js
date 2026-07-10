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

/** Single club detail (any status) for the create/edit form. */
export function useAdminClub(id) {
  return useQuery({
    queryKey: ['admin', 'club', id],
    queryFn: () => adminService.getClub(id),
    enabled: Boolean(id),
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

/** Create an organization directly from the admin panel. */
export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminService.createClub(body),
    onSuccess: () => {
      invalidateKeys(qc, [['admin', 'clubs'], ['admin', 'stats']]);
      toast.success('Organization created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Edit an organization's content and admin-only fields. */
export function useUpdateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminService.updateClub(id, body),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'clubs'], ['admin', 'stats']]);
      qc.invalidateQueries({ queryKey: ['admin', 'club', variables.id] });
      toast.success('Organization updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Upload/replace an organization's logo. */
export function useUploadClubLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => adminService.uploadClubLogo(id, file),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'clubs']]);
      qc.invalidateQueries({ queryKey: ['admin', 'club', variables.id] });
      toast.success('Logo updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Add photos to an organization's gallery. */
export function useAddClubGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }) => adminService.addClubGallery(id, files),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'club', variables.id] });
      toast.success('Photos added');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Remove one photo from an organization's gallery. */
export function useRemoveClubGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, image }) => adminService.removeClubGallery(id, image),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'club', variables.id] });
      toast.success('Photo removed');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Invite a new admin by email. */
export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email) => adminService.createAdmin(email),
    onSuccess: () => {
      invalidateKeys(qc, [['admin', 'users'], ['admin', 'stats']]);
      toast.success('Admin added — a set-password link has been emailed to them');
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

/** Single event detail for the create/edit form. */
export function useAdminEvent(id) {
  return useQuery({
    queryKey: ['admin', 'event', id],
    queryFn: () => adminService.getEvent(id),
    enabled: Boolean(id),
  });
}

/** Create an event for an organization. */
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminService.createEvent(body),
    onSuccess: () => {
      invalidateKeys(qc, [['admin', 'events'], ['admin', 'stats']]);
      toast.success('Event created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Edit an event. */
export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminService.updateEvent(id, body),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'events']]);
      qc.invalidateQueries({ queryKey: ['admin', 'event', variables.id] });
      toast.success('Event updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

/** Upload/replace an event's cover image. */
export function useUploadEventCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => adminService.uploadEventCover(id, file),
    onSuccess: (_data, variables) => {
      invalidateKeys(qc, [['admin', 'events']]);
      qc.invalidateQueries({ queryKey: ['admin', 'event', variables.id] });
      toast.success('Cover image updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
