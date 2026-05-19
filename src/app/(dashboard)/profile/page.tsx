"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2, User, Shield, CreditCard, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { DatePicker } from "@/components/ui/date-picker";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/components/ui/toast";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { api, FetchError } from "@/lib/api/client";

const profileSchema = z.object({
  firstName:   z.string().min(2, "First name must be at least 2 characters"),
  lastName:    z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().optional(),
  address:     z.string().optional(),
  state:       z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const bankSchema = z.object({
  bankCode:      z.string().min(1, "Select a bank"),
  bankName:      z.string().min(1),
  accountNumber: z.string().length(10, "Account number must be 10 digits"),
  accountName:   z.string().min(2, "Enter account holder name"),
  setAsDefault:  z.boolean().optional(),
});
type BankForm = z.infer<typeof bankSchema>;

const NIGERIAN_BANKS = [
  { code: "011", name: "First Bank" },
  { code: "044", name: "Access Bank" },
  { code: "058", name: "GTBank" },
  { code: "057", name: "Zenith Bank" },
  { code: "033", name: "UBA" },
  { code: "050", name: "Ecobank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "214", name: "FCMB" },
  { code: "215", name: "Unity Bank" },
  { code: "032", name: "Union Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "305", name: "Opay" },
  { code: "090405", name: "Moniepoint" },
  { code: "627", name: "Kuda Bank" },
  { code: "566", name: "PalmPay" },
];

type TabKey = "profile" | "bank-accounts" | "kyc";

type ProfilePayload = Partial<ProfileForm> & {
  id?: string;
  avatarUrl?: string | null;
};

function normalizeDate(value: unknown) {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : "";
}

export default function ProfilePage() {
  const [tab, setTab]           = useState<TabKey>("profile");
  const [addingBank, setAddingBank] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const { toast }               = useToast();
  const { accounts, loading: bankLoading, refresh: refreshBanks } = useBankAccounts();

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const bankForm    = useForm<BankForm>({ resolver: zodResolver(bankSchema) });

  useEffect(() => {
    api.get<{ profile: ProfilePayload | null }>("/api/profile")
      .then((d) => {
        if (d.profile) {
          profileForm.reset({
            firstName:   d.profile.firstName ?? "",
            lastName:    d.profile.lastName ?? "",
            dateOfBirth: normalizeDate(d.profile.dateOfBirth),
            address:     d.profile.address ?? "",
            state:       d.profile.state ?? "",
          });
          setAvatarUrl(d.profile.avatarUrl ?? null);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveProfile(data: ProfileForm) {
    try {
      await api.patch("/api/profile", data);
      toast("Profile updated successfully", "success");
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Update failed", "error");
    }
  }

  async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarBusy(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) throw new FetchError(res.status, json.error ?? "Upload failed");
      const nextAvatar = json.data.avatarUrl as string | null;
      setAvatarUrl(nextAvatar);
      window.dispatchEvent(new CustomEvent("airtimevault:avatar-updated", { detail: { avatarUrl: nextAvatar } }));
      toast("Display picture updated", "success");
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Could not upload display picture", "error");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new FetchError(res.status, json.error ?? "Remove failed");
      setAvatarUrl(null);
      window.dispatchEvent(new CustomEvent("airtimevault:avatar-updated", { detail: { avatarUrl: null } }));
      toast("Display picture removed", "success");
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Could not remove display picture", "error");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function addBank(data: BankForm) {
    try {
      await api.post("/api/bank-accounts", data);
      toast("Bank account added", "success");
      bankForm.reset();
      setAddingBank(false);
      refreshBanks();
    } catch (e) {
      toast(e instanceof FetchError ? e.message : "Failed to add account", "error");
    }
  }

  const selectedBank = bankForm.watch("bankCode");
  const firstName = profileForm.watch("firstName");
  const lastName = profileForm.watch("lastName");
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "My Account";
  useEffect(() => {
    const bank = NIGERIAN_BANKS.find((b) => b.code === selectedBank);
    if (bank) bankForm.setValue("bankName", bank.name);
  }, [selectedBank, bankForm]);

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "profile",       label: "Profile",       icon: <User        className="w-4 h-4" /> },
    { key: "bank-accounts", label: "Bank Accounts", icon: <CreditCard  className="w-4 h-4" /> },
    { key: "kyc",           label: "KYC / Identity",icon: <Shield      className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and account settings.</p>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-white">Personal Information</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
            <UserAvatar src={avatarUrl} name={displayName} size="xl" className="mx-auto sm:mx-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Display Picture</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a square JPG, PNG, or WebP image. Maximum size is 900KB.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">
                  {avatarBusy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                  {avatarUrl ? "Change picture" : "Upload picture"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={avatarBusy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.currentTarget.value = "";
                      if (file) uploadAvatar(file);
                    }}
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={avatarBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
              <input
                {...profileForm.register("firstName")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Ade"
              />
              {profileForm.formState.errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
              <input
                {...profileForm.register("lastName")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Johnson"
              />
              {profileForm.formState.errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth</label>
            <DatePicker
              value={profileForm.watch("dateOfBirth") ?? ""}
              onChange={(value) => profileForm.setValue("dateOfBirth", value, { shouldDirty: true, shouldValidate: true })}
              placeholder="Select date of birth"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
            <input
              {...profileForm.register("address")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">State</label>
            <input
              {...profileForm.register("state")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Lagos"
            />
          </div>
          <Button type="submit" disabled={profileForm.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6">
            {profileForm.formState.isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      )}

      {tab === "bank-accounts" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {bankLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />)}
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No bank accounts saved yet.</p>
              </div>
            ) : (
              accounts.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white text-sm">{a.bankName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{a.accountNumber} — {a.accountName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.isDefault && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                    )}
                    <button type="button" className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" aria-label="Remove account">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!addingBank ? (
            <button
              type="button"
              onClick={() => setAddingBank(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Bank Account
            </button>
          ) : (
            <form onSubmit={bankForm.handleSubmit(addBank)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Add New Bank Account</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bank</label>
                <AppSelect
                  value={bankForm.watch("bankCode") ?? ""}
                  placeholder="Select bank"
                  options={NIGERIAN_BANKS.map((b) => ({ value: b.code, label: b.name }))}
                  onChange={(value) => bankForm.setValue("bankCode", value, { shouldDirty: true, shouldValidate: true })}
                />
                {bankForm.formState.errors.bankCode && <p className="text-red-500 text-xs mt-1">{bankForm.formState.errors.bankCode.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Number</label>
                <input
                  {...bankForm.register("accountNumber")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0123456789"
                  maxLength={10}
                />
                {bankForm.formState.errors.accountNumber && <p className="text-red-500 text-xs mt-1">{bankForm.formState.errors.accountNumber.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Name</label>
                <input
                  {...bankForm.register("accountName")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="As it appears on your bank statement"
                />
                {bankForm.formState.errors.accountName && <p className="text-red-500 text-xs mt-1">{bankForm.formState.errors.accountName.message}</p>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...bankForm.register("setAsDefault")} type="checkbox" className="rounded" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Set as default account</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit" disabled={bankForm.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5">
                  {bankForm.formState.isSubmitting ? "Saving…" : "Save Account"}
                </Button>
                <Button type="button" onClick={() => { setAddingBank(false); bankForm.reset(); }} variant="outline" className="rounded-xl border-slate-200 px-5">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "kyc" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 dark:text-white">Identity Verification</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Verify your identity to unlock higher transaction limits.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { level: "Level 1", limit: "₦100,000/day", desc: "BVN or NIN verification",          badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" },
              { level: "Level 2", limit: "₦500,000/day", desc: "Government ID + selfie",             badge: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300" },
              { level: "Business", limit: "₦5,000,000/day", desc: "Business registration documents", badge: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" },
            ].map(({ level, limit, desc, badge }) => (
              <div key={level} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>{level}</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{limit}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
                <a href="/kyc" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Apply →</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
