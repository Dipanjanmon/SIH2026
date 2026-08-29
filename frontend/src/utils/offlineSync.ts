/**
 * Offline sync utility for PashuRaksha.
 * Stores disease reports in localStorage when offline,
 * syncs to server when connection is restored.
 */

import apiClient from '../api/client';

const PENDING_REPORTS_KEY = 'pashuraksha_pending_reports';

interface PendingReport {
  id: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export function savePendingReport(data: Record<string, unknown>): void {
  const pending = getPendingReports();
  pending.push({
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    data,
    timestamp: Date.now(),
  });
  localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pending));
}

export function getPendingReports(): PendingReport[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_REPORTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getPendingCount(): number {
  return getPendingReports().length;
}

export function clearSyncedReport(id: string): void {
  const pending = getPendingReports().filter(r => r.id !== id);
  localStorage.setItem(PENDING_REPORTS_KEY, JSON.stringify(pending));
}

export async function syncPendingReports(): Promise<{ synced: number; failed: number }> {
  const pending = getPendingReports();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const report of pending) {
    try {
      await apiClient.post('/cases', report.data);
      clearSyncedReport(report.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => {
      syncPendingReports().then(result => {
        if (result.synced > 0) {
          console.log(`[OfflineSync] Synced ${result.synced} pending reports`);
        }
      });
    }, 2000); // Wait 2s for stable connection
  });
}
