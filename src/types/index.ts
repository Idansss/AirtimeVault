export type Network        = "MTN" | "AIRTEL" | "GLO" | "NINEMOBILE";
export type KYCLevel       = "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "BUSINESS";
export type MembershipTier = "BASIC" | "SILVER" | "GOLD" | "BUSINESS";
export type UserRole       = "USER" | "MERCHANT" | "AGENT" | "ADMIN" | "SUPER_ADMIN";

export type ConversionStatus =
  | "PENDING" | "PROCESSING" | "SUCCESSFUL" | "REJECTED" | "REVERSED" | "UNDER_REVIEW";

export type WithdrawalStatus =
  | "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED" | "REVERSED";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";

export interface SessionUser {
  id:             string;
  email:          string;
  phone:          string;
  username:       string;
  role:           UserRole;
  kycLevel:       KYCLevel;
  membershipTier: MembershipTier;
  emailVerified:  boolean;
  phoneVerified:  boolean;
}

export interface WalletSummary {
  availableBalance: number;
  pendingBalance:   number;
  lockedBalance:    number;
  totalConverted:   number;
  totalWithdrawn:   number;
  totalSpent:       number;
  cashbackEarned:   number;
  referralEarned:   number;
}

export interface LedgerEntry {
  id:            string;
  type:          string;
  status:        TransactionStatus;
  amount:        number;
  balanceBefore: number;
  balanceAfter:  number;
  fee:           number;
  reference:     string;
  description:   string;
  createdAt:     string;
}

export interface ConversionRequest {
  id:            string;
  network:       Network;
  phoneNumber:   string;
  airtimeAmount: number;
  ratePercent:   number;
  walletAmount:  number;
  fee:           number;
  status:        ConversionStatus;
  reference:     string;
  proofUrl?:     string;
  adminNote?:    string;
  createdAt:     string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  message?: string;
  error?:   string;
}
