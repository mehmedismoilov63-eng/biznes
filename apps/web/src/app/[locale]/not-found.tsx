"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/home`);
  }, [locale, router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#999" }}>...</p>
    </div>
  );
}
