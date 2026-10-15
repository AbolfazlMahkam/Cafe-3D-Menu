"use client";

import { useI18n } from "@/lib/i18n/provider";

export function SkipLink() {
  const { messages } = useI18n();
  return (
    <a
      href="#menu"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-noir"
    >
      {messages.a11y.skipToMenu}
    </a>
  );
}

export default SkipLink;
