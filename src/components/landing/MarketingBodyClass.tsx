"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasPersistedAuthSession } from "../../lib/authPersistence";
import { STATIC_MARKETING_PATHS } from "../../lib/seo/publicRoutes";

const APP_ROUTES = [
  "/app?tab=dashboard",
  "/app?tab=learn",
  "/app?tab=grammar",
  "/app?tab=vocabulary",
  "/app?tab=write",
  "/app?tab=coach",
  "/app?tab=creative",
];

export function MarketingBodyClass() {
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add("marketing-page");
    return () => {
      document.body.classList.remove("marketing-page");
    };
  }, []);

  useEffect(() => {
    STATIC_MARKETING_PATHS.filter((path) => path !== "/").forEach((path) => router.prefetch(path));
    if (!hasPersistedAuthSession()) return;
    APP_ROUTES.forEach((route) => router.prefetch(route));
  }, [router]);

  return null;
}
