"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import type { WalletSummary, LedgerEntry } from "@/types";

interface WalletResponse {
  wallet: WalletSummary & { id: string };
  ledgerEntries: LedgerEntry[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export function useWallet(page = 1, limit = 10) {
  const [data, setData]       = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<WalletResponse>(`/api/wallet?page=${page}&limit=${limit}`);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}
