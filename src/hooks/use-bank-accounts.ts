"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";

export interface BankAccount {
  id:            string;
  bankName:      string;
  bankCode:      string;
  accountNumber: string;
  accountName:   string;
  isDefault:     boolean;
}

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading]   = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get<{ accounts: BankAccount[] }>("/api/bank-accounts");
      setAccounts(d.accounts);
    } catch {
      // silently fail — empty list shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { accounts, loading, refresh };
}
