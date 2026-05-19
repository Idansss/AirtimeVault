"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";

export interface AppNotification {
  id:        string;
  title:     string;
  body:      string;
  type:      string;
  isRead:    boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: AppNotification[];
  unread:        number;
  pagination:    { page: number; limit: number; total: number; pages: number };
}

export function useNotifications(page = 1) {
  const [data, setData]       = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<NotificationsResponse>(`/api/notifications?page=${page}&limit=20`);
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { refresh(); }, [refresh]);

  async function markAllRead() {
    await api.patch("/api/notifications", { markAll: true });
    refresh();
  }

  async function markRead(id: string) {
    await api.patch("/api/notifications", { ids: [id] });
    setData((prev) =>
      prev
        ? {
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          }
        : prev
    );
  }

  return { data, loading, refresh, markAllRead, markRead };
}
