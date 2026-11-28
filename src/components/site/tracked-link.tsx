"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackedLink({
  eventName,
  eventParams,
  children,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventParams: Record<string, string | number | boolean | undefined>;
  children: ReactNode;
}) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent(eventName, eventParams);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
