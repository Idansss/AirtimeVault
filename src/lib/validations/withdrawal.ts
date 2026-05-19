import { z } from "zod";

export const withdrawalSchema = z.object({
  bankAccountId: z.string().min(1, "Select a bank account"),
  amount:        z.number().min(1000, "Minimum withdrawal is ₦1,000").max(5_000_000, "Maximum withdrawal is ₦5,000,000"),
  pin:           z.string().length(4, "Enter your 4-digit PIN"),
});

export const addBankAccountSchema = z.object({
  bankCode:      z.string().min(1, "Select a bank"),
  accountNumber: z.string().length(10, "Account number must be 10 digits"),
});

export const transferSchema = z.object({
  recipient: z.string().min(1, "Enter username, phone, or email"),
  amount:    z.number().min(100, "Minimum transfer is ₦100"),
  note:      z.string().max(100).optional(),
  pin:       z.string().length(4, "Enter your 4-digit PIN"),
});

export type WithdrawalInput      = z.infer<typeof withdrawalSchema>;
export type AddBankAccountInput  = z.infer<typeof addBankAccountSchema>;
export type TransferInput        = z.infer<typeof transferSchema>;
