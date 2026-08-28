import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Farm, Animal, Vaccination } from '../types';

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: async () => {
      const res = await apiClient.get<Farm[]>('/farms');
      return res.data;
    },
  });
}

export function useAnimals(farmId?: number) {
  return useQuery({
    queryKey: ['animals', farmId],
    queryFn: async () => {
      const url = farmId ? `/farms/${farmId}/animals` : '/animals';
      const res = await apiClient.get<Animal[]>(url);
      return res.data;
    },
  });
}

export function useVaccinations() {
  return useQuery({
    queryKey: ['vaccinations'],
    queryFn: async () => {
      const res = await apiClient.get<Vaccination[]>('/vaccinations');
      return res.data;
    },
  });
}

export function useAddVaccination() {
  return useQuery({
    queryKey: ['vaccinations'],
    queryFn: async () => {
      const res = await apiClient.get<Vaccination[]>('/vaccinations');
      return res.data;
    },
  });
}
