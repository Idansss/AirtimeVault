import { z } from "zod";
import { NETWORKS } from "@/lib/constants";

export const airtimeConversionSchema = z.object({
  network:       z.enum(NETWORKS, { message: "Select a network" }),
  phoneNumber:   z.string().regex(/^(\+234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  airtimeAmount: z.number().min(500, "Minimum conversion is ₦500").max(500_000, "Maximum conversion is ₦500,000"),
  pin:           z.string().length(4, "Enter your 4-digit PIN"),
  proofUrl:      z.string().url().optional(),
});

export const dataConversionSchema = z.object({
  network:     z.enum(NETWORKS, { message: "Select a network" }),
  phoneNumber: z.string().regex(/^(\+234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  dataBundle:  z.string().min(1, "Select a data bundle"),
  description: z.string().max(500).optional(),
  pin:         z.string().length(4, "Enter your 4-digit PIN"),
});

export type AirtimeConversionInput = z.infer<typeof airtimeConversionSchema>;
export type DataConversionInput    = z.infer<typeof dataConversionSchema>;
