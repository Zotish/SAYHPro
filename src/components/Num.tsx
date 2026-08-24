import React from "react";
import { useApp, toBnDigits } from "../context/AppContext";

interface NumProps {
  children?: React.ReactNode;
  value?: number | string | null;
  currency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function Num({
  children,
  value,
  currency = false,
  prefix = "",
  suffix = "",
  className = "",
}: NumProps) {
  const { lang } = useApp();
  const raw = value !== undefined ? value : children;

  if (raw === undefined || raw === null) return null;

  let formatted = typeof raw === "number" ? raw.toLocaleString("en-US") : raw.toString();

  if (lang === "bn") {
    formatted = toBnDigits(formatted);
  }

  const currPrefix = currency ? "৳" : "";

  return (
    <span className={`num ${className}`}>
      {prefix}{currPrefix}{formatted}{suffix}
    </span>
  );
}
