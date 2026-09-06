import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

export function Button({
  to,
  href,
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
}: Props) {
  const styles = {
    primary: "bg-brand text-white hover:bg-teal",
    outline: "border border-white/70 text-white hover:bg-white/10",
    ghost: "text-teal hover:text-brand",
  }[variant];

  const cls = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition ${styles} ${className}`;

  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
