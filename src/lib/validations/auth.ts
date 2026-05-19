import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName:  z.string().min(2, "Last name must be at least 2 characters"),
  email:     z.string().email("Enter a valid email address"),
  phone:     z.string().regex(/^(\+234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  username:  z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "Username: lowercase letters, numbers, underscores only"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email, phone, or username required"),
  password:   z.string().min(1, "Password required"),
});

export const otpSchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const setPinSchema = z.object({
  pin:        z.string().length(4, "PIN must be 4 digits").regex(/^\d+$/, "PIN must be numeric"),
  confirmPin: z.string().length(4),
}).refine((d) => d.pin === d.confirmPin, { message: "PINs do not match", path: ["confirmPin"] });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type OTPInput      = z.infer<typeof otpSchema>;
export type SetPinInput   = z.infer<typeof setPinSchema>;
