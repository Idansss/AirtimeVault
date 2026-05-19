import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  title?: string;
}

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  compact?: boolean;
  admin?: boolean;
}

export function AirtimeVaultMark({ className, title = "AirtimeVault" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={`${title} logo`}
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="av-mark-bg" x1="10" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="0.5" stopColor="#10B981" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="av-mark-glow" x1="18" y1="10" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" stopOpacity="0.95" />
          <stop offset="1" stopColor="#A7F3D0" stopOpacity="0.78" />
        </linearGradient>
        <filter id="av-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#022C22" floodOpacity="0.24" />
        </filter>
      </defs>

      <rect width="64" height="64" rx="18" fill="#052E2B" />
      <rect x="5" y="5" width="54" height="54" rx="15" fill="url(#av-mark-bg)" filter="url(#av-mark-shadow)" />
      <path
        d="M18 43.5 30.5 19a2 2 0 0 1 3.6.1l11.9 24.4"
        fill="none"
        stroke="url(#av-mark-glow)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5 36.5h15"
        fill="none"
        stroke="#052E2B"
        strokeOpacity="0.7"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M30.5 43.5 43.5 22"
        fill="none"
        stroke="#052E2B"
        strokeOpacity="0.92"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="47" cy="17" r="3.2" fill="#ECFDF5" />
      <path
        d="M43.5 11.5c4 0 7.2 3.1 7.2 7.1M40.5 7.5c6.8 0 12.3 5.3 12.3 12"
        fill="none"
        stroke="#ECFDF5"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function AirtimeVaultLogo({
  className,
  markClassName,
  textClassName,
  compact = false,
  admin = false,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <AirtimeVaultMark className={cn("size-9", markClassName)} />
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className={cn("block font-display font-bold tracking-tight", textClassName)}>
            AirtimeVault
          </span>
          {admin && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Admin</span>}
        </span>
      )}
    </span>
  );
}
