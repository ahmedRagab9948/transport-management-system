import { QUERY_KEYS, TRIP_PREFIX } from '@tms/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripsService } from '../services/trips.service';
import type {
  CreateTripPayload,
  TripTableRow,
  TripsQueryParams,
  UpdateTripPayload,
} from '../types/trip.types';

const TRIPS_ROOT = [QUERY_KEYS.TRIPS] as const;

export const tripsQueryKeys = {
  all: TRIPS_ROOT,
  list: (params: TripsQueryParams) => [...TRIPS_ROOT, 'list', params] as const,
  detail: (id: string) => [...TRIPS_ROOT, 'detail', id] as const,
  summary: [...TRIPS_ROOT, 'summary'] as const,
  vehicles: [...TRIPS_ROOT, 'vehicles'] as const,
  drivers: [...TRIPS_ROOT, 'drivers'] as const,
  clients: [...TRIPS_ROOT, 'clients'] as const,
};

const STALE_TIMES = {
  list: 30 * 1000,
  detail: 30 * 1000,
  picklists: 5 * 60 * 1000,
};

function mapTrip(trip: any): TripTableRow {
  const digits = String(trip.tripNumber).replace(/\D/g, '');
  const shortNum = digits.slice(-6).padStart(6, '0');
  return {
    ...trip,
    formattedTripNumber: `${TRIP_PREFIX}${shortNum}`,
    route: `${trip.fromLocation} → ${trip.toLocation}`,
    contractDisplay: trip.contract?.contractNumber ?? '-',
    clientDisplay: trip.client?.companyName ?? '-',
  };
}

export function useTrips(params: TripsQueryParams) {
  return useQuery({
    queryKey: tripsQueryKeys.list(params),
    queryFn: async () => {
      const response = await tripsService.getTrips(params);
      return {
        ...response,
        items: response.items.map(mapTrip),
      };
    },
    staleTime: STALE_TIMES.list,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: tripsQueryKeys.detail(id),
    queryFn: () => tripsService.getTrip(id),
    enabled: !!id,
    staleTime: STALE_TIMES.detail,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTripPayload) => tripsService.createTrip(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.summary });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISPATCH_BOARD] });
    },
    retry: false,
  });
}

export function useUpdateTrip(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTripPayload) => tripsService.updateTrip(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.summary });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISPATCH_BOARD] });
    },
    retry: false,
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tripsService.deleteTrip(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.summary });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISPATCH_BOARD] });
    },
    retry: false,
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes, reasonCode, actualEndDate }: { id: string; status: string; notes?: string; reasonCode?: string; actualEndDate?: string }) =>
      tripsService.updateTripStatus(id, { status, notes, reasonCode, actualEndDate }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: tripsQueryKeys.detail(variables.id) });
      const previousTrip = queryClient.getQueryData(tripsQueryKeys.detail(variables.id));
      if (previousTrip) {
        queryClient.setQueryData(tripsQueryKeys.detail(variables.id), {
          ...(previousTrip as any),
          status: variables.status,
        });
      }
      return { previousTrip };
    },
    onError: (_err, variables, context) => {
      if (context?.previousTrip) {
        queryClient.setQueryData(tripsQueryKeys.detail(variables.id), context.previousTrip);
      }
    },
    onSettled: async (_data, _err, variables) => {
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: tripsQueryKeys.summary });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DISPATCH_BOARD] });
    },
    retry: false,
  });
}

export function useTripVehicles() {
  return useQuery({
    queryKey: tripsQueryKeys.vehicles,
    queryFn: () => tripsService.getVehicles(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTripDrivers() {
  return useQuery({
    queryKey: tripsQueryKeys.drivers,
    queryFn: () => tripsService.getDrivers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTripClients() {
  return useQuery({
    queryKey: tripsQueryKeys.clients,
    queryFn: () => tripsService.getClients(),
    staleTime: 5 * 60 * 1000,
  });
}
