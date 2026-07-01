import { QUERY_KEYS } from '@tms/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import type { CreateUserPayload, UpdateUserPayload, UsersQueryParams } from '../types/user.types';

const USERS_ROOT = [QUERY_KEYS.USERS] as const;

export const usersQueryKeys = {
  all: USERS_ROOT,
  list: (params: UsersQueryParams) => [...USERS_ROOT, 'list', params] as const,
  detail: (id: string) => [...USERS_ROOT, 'detail', id] as const,
  summary: [...USERS_ROOT, 'summary'] as const,
  roles: [...USERS_ROOT, 'roles'] as const,
};

const STALE_TIMES = {
  list: 30 * 1000,
  detail: 30 * 1000,
  summary: 30 * 1000,
  roles: 5 * 60 * 1000,
};

export function useUsers(params: UsersQueryParams) {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: () => usersService.getUsers(params),
    staleTime: STALE_TIMES.list,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersQueryKeys.detail(id),
    queryFn: () => usersService.getUser(id),
    enabled: !!id,
    staleTime: STALE_TIMES.detail,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUsersRoles() {
  return useQuery({
    queryKey: usersQueryKeys.roles,
    queryFn: () => usersService.getRoles(),
    staleTime: STALE_TIMES.roles,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUsersSummary() {
  return useQuery({
    queryKey: usersQueryKeys.summary,
    queryFn: () => usersService.getSummary(),
    staleTime: STALE_TIMES.summary,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.summary });
    },
    retry: false,
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersService.updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.summary });
    },
    retry: false,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.summary });
    },
    retry: false,
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.activateUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.summary });
    },
    retry: false,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => usersService.resetPassword(id),
    retry: false,
  });
}

export function useForceLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.forceLogout(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
    retry: false,
  });
}
