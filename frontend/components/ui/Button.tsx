"use client";

import { ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "link";

interface ButtonProps {
  children: ReactNode;
  /** primary = fond noir, secondary = contour noir, link = lien discret doré "Découvrir →" */
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  /** sur fond sombre, inverse les couleurs (contour blanc, etc.) */
  onDark?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-[6px] px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

function variantClasses(variant: ButtonVariant, onDark: boolean): string {
  switch (variant) {
    case "primary":
      return onDark
        ? "bg-white text-si-black hover:bg-si-gold-soft"
        : "bg-si-black text-white hover:bg-si-charcoal";
    case "secondary":
      return onDark
        ? "border border-white/40 text-white hover:border-white hover:bg-white/5"
        : "border border-si-black/30 text-si-text hover:border-si-black hover:bg-black/[0.03]";
    case "link":
      return "px-0 py-0 text-si-gold hover:gap-3"; // la flèche s'éloigne au survol
    default:
      return "";
  }
}

/**
 * 2 vrais styles de bouton (primaire / secondaire) + un variant "link" discret.
 * Aucune autre couleur (pas de bleu/gris/violet/orange).
 */
export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  onDark = false,
}: ButtonProps) {
  const classes = `${base} ${variantClasses(variant, onDark)} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
        {variant === "link" && <span aria-hidden="true">→</span>}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
      {variant === "link" && <span aria-hidden="true">→</span>}
    </button>
  );
}
