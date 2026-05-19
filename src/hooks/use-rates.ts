"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";
import { DEFAULT_RATES } from "@/lib/constants";
import type { MembershipTier } from "@/types";

type RateMap = typeof DEFAULT_RATES;

interface RatesResponse {
  rates: RateMap;
  tier:  MembershipTier;
}

export function useRates() {
  const [rates,   setRates]   = useState<RateMap>(DEFAULT_RATES);
  const [tier,    setTier]    = useState<MembershipTier>("BASIC");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<RatesResponse>("/api/rates")
      .then((d) => {
        if (d.rates) setRates(d.rates as RateMap);
        if (d.tier)  setTier(d.tier);
      })
      .catch(() => {}) // keep DEFAULT_RATES on failure
      .finally(() => setLoading(false));
  }, []);

  function rateFor(network: keyof RateMap): number {
    return rates[network]?.[tier] ?? rates[network]?.BASIC ?? 0;
  }

  return { rates, tier, loading, rateFor };
}
