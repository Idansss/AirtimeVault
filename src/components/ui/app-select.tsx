"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface AppSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}

export function AppSelect({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  variant = "light",
  size = "md",
  className,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const dark = variant === "dark";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border text-left transition-all outline-none disabled:cursor-not-allowed disabled:opacity-60",
          size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm",
          dark
            ? "border-slate-600 bg-slate-700 text-white hover:border-emerald-400 focus:border-emerald-400 focus:ring-3 focus:ring-emerald-500/15"
            : "border-slate-200 bg-white text-slate-900 hover:border-emerald-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10"
        )}
      >
        <span className={cn("truncate", !selected && (dark ? "text-slate-400" : "text-slate-400"))}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
            dark ? "text-slate-300" : "text-slate-400"
          )}
        />
      </button>

      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className={cn(
            "absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border p-1.5 shadow-xl",
            dark
              ? "border-slate-600 bg-slate-800 shadow-slate-950/30"
              : "border-slate-200 bg-white shadow-slate-900/10"
          )}
        >
          {options.length === 0 ? (
            <div className={cn("px-3 py-2 text-sm", dark ? "text-slate-400" : "text-slate-500")}>
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    dark
                      ? "text-slate-100 hover:bg-slate-700"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800",
                    isSelected && (dark ? "bg-emerald-500/15 text-emerald-200" : "bg-emerald-50 text-emerald-700")
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{option.label}</span>
                    {option.description && (
                      <span className={cn("block truncate text-xs", dark ? "text-slate-400" : "text-slate-500")}>
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="size-4 shrink-0 text-emerald-500" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
