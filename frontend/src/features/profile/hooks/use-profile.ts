'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@tms/shared';
import { useToast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { profileService } from '../services/profile.service';
import type { ChangePasswordPayload, UpdateProfilePayload } from '../types/profile.types';

const profileQueryKeys = {
  all: [QUERY_KEYS.PROFILE] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKeys.all,
    queryFn: () => profileService.getProfile(),
    staleTime: 30_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { t } = useT();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      toast({ title: t('profile.updated'), variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: t('common.operation_failed'),
        description: getApiErrorMessage(error, t('common.retry')),
        variant: 'error',
      });
    },
    retry: false,
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  const { t } = useT();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileService.changePassword(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
      toast({ title: t('profile.password_changed'), variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: t('common.operation_failed'),
        description: getApiErrorMessage(error, t('common.retry')),
        variant: 'error',
      });
    },
    retry: false,
  });
}
