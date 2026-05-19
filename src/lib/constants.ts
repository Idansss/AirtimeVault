export const NETWORKS = ["MTN", "AIRTEL", "GLO", "NINEMOBILE"] as const;

export const NETWORK_LABELS: Record<string, string> = {
  MTN: "MTN",
  AIRTEL: "Airtel",
  GLO: "Glo",
  NINEMOBILE: "9mobile",
};

export const NETWORK_COLORS: Record<string, string> = {
  MTN: "#FFC107",
  AIRTEL: "#E53935",
  GLO: "#43A047",
  NINEMOBILE: "#1E88E5",
};

// Default conversion rates per tier (%)
export const DEFAULT_RATES = {
  MTN:       { BASIC: 75, SILVER: 78, GOLD: 80, BUSINESS: 82 },
  AIRTEL:    { BASIC: 72, SILVER: 75, GOLD: 78, BUSINESS: 80 },
  GLO:       { BASIC: 65, SILVER: 68, GOLD: 70, BUSINESS: 72 },
  NINEMOBILE:{ BASIC: 60, SILVER: 63, GOLD: 65, BUSINESS: 67 },
};

export const WITHDRAWAL_FEES = [
  { min: 1000,   max: 10000,  fee: 50  },
  { min: 10001,  max: 100000, fee: 100 },
  { min: 100001, max: Infinity, fee: 200 },
];

export const KYC_DAILY_LIMITS: Record<string, number> = {
  LEVEL_0: 10_000,
  LEVEL_1: 100_000,
  LEVEL_2: 500_000,
  BUSINESS: 5_000_000,
};

export const BILL_CATEGORIES = [
  { value: "AIRTIME",     label: "Airtime"       },
  { value: "DATA",        label: "Data Bundle"   },
  { value: "ELECTRICITY", label: "Electricity"   },
  { value: "CABLE_TV",    label: "Cable TV"      },
  { value: "INTERNET",    label: "Internet"      },
  { value: "EXAM_PIN",    label: "Exam Pin"      },
  { value: "SCHOOL",      label: "School"        },
  { value: "TRANSPORT",   label: "Transport"     },
];

export const MEMBERSHIP_TIERS = ["BASIC", "SILVER", "GOLD", "BUSINESS"] as const;

export const APP_NAME = "AirtimeVault";
export const APP_TAGLINE = "Turn unused airtime into spendable money.";
export const SUPPORT_EMAIL = "support@airtimevault.com";
export const SUPPORT_WHATSAPP = "+2349000000000";
