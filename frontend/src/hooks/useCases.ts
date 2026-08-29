import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { DiseaseCase, LabSample } from '../types';

export function useCases(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: async () => {
      const res = await apiClient.get<DiseaseCase[]>('/cases', { params });
      return res.data;
    },
  });
}

export function useCase(id: number | string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      const res = await apiClient.get<DiseaseCase>(`/cases/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useReportCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.post('/cases', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiClient.put(`/cases/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useLabSamples(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['labSamples', params],
    queryFn: async () => {
      const res = await apiClient.get<LabSample[]>('/lab-samples', { params });
      return res.data;
    },
  });
}

export function useUpdateSampleResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, result, diseaseDetected }: { id: number; result: string; diseaseDetected: string }) => {
      const res = await apiClient.put(`/lab-samples/${id}/result`, { result, diseaseDetected });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labSamples'] });
    },
  });
}
