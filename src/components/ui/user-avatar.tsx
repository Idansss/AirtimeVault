"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  initials?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_STYLES = {
  sm: "size-8 text-sm",
  md: "size-10 text-base",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

function getInitials(name?: string | null, initials?: string | null) {
  if (initials) return initials.slice(0, 2).toUpperCase();
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function UserAvatar({ src, name, initials, size = "sm", className }: UserAvatarProps) {
  const fallback = getInitials(name, initials);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border border-white/30 bg-emerald-600 text-white shadow-sm",
        SIZE_STYLES[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name ? `${name} display picture` : "Display picture"}
          fill
          sizes={size === "xl" ? "96px" : size === "lg" ? "64px" : "40px"}
          className="object-cover"
          unoptimized={src.startsWith("data:")}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold leading-none">
          {fallback}
        </span>
      )}
    </span>
  );
}
