import Image from "next/image";
import { NETWORK_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NetworkKey = "MTN" | "AIRTEL" | "GLO" | "NINEMOBILE";

const NETWORK_LOGOS: Record<NetworkKey, string> = {
  MTN: "/network-logos/mtn.png",
  AIRTEL: "/network-logos/airtel.png",
  GLO: "/network-logos/glo.png",
  NINEMOBILE: "/network-logos/9mobile.png",
};

const FRAME_STYLES: Record<NetworkKey, string> = {
  MTN: "bg-[#ffc400] border-[#f2bd00]",
  AIRTEL: "bg-[#ed1b24] border-[#dc1520]",
  GLO: "bg-white border-emerald-200",
  NINEMOBILE: "bg-black border-lime-300/40",
};

const IMAGE_PADDING: Record<NetworkKey, string> = {
  MTN: "p-1.5",
  AIRTEL: "p-1",
  GLO: "p-1",
  NINEMOBILE: "p-1",
};

interface NetworkLogoProps {
  network: NetworkKey;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_STYLES = {
  xs: "size-6 rounded-lg",
  sm: "size-8 rounded-xl",
  md: "size-10 rounded-xl",
  lg: "size-14 rounded-2xl",
};

export function NetworkLogo({ network, size = "sm", className }: NetworkLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden border shadow-sm",
        SIZE_STYLES[size],
        FRAME_STYLES[network],
        className
      )}
    >
      <Image
        src={NETWORK_LOGOS[network]}
        alt={`${NETWORK_LABELS[network]} logo`}
        fill
        sizes={size === "lg" ? "56px" : size === "md" ? "40px" : "32px"}
        className={cn("object-contain", IMAGE_PADDING[network])}
      />
    </span>
  );
}
