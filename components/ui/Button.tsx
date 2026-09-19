import { clsx } from "@/lib/clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "default" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-fg text-bg border-fg hover:bg-white hover:border-white disabled:opacity-40",
  default:
    "bg-surface text-fg border-border hover:border-border-strong hover:bg-[#161616]",
  ghost:
    "bg-transparent text-muted border-transparent hover:text-fg hover:bg-surface",
  danger:
    "bg-transparent text-danger border-transparent hover:bg-[#1a1010] hover:border-[#3a1e1e]",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[3px] border font-medium",
        "transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
