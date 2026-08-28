import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { RiskZone, Alert } from '../types';

export function useRiskZones() {
  return useQuery({
    queryKey: ['riskZones'],
    queryFn: async () => {
      const res = await apiClient.get<RiskZone[]>('/risk/clusters');
      return res.data;
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await apiClient.get<Alert[]>('/alerts');
      return res.data;
    },
  });
}
