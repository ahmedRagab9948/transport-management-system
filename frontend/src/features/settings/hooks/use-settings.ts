import { QUERY_KEYS } from '@tms/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useT } from '@/lib/i18n';
import { settingsService } from '../services/settings.service';
import type { UpdateSettingsPayload } from '../types/settings.types';

export function useSettings() {
  return useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useT();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
      toast({ title: t('settings.saved'), variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: t('common.operation_failed'),
        description: getApiErrorMessage(error, t('common.retry')),
        variant: 'error',
      });
    },
  });
}
