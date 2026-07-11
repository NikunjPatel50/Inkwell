"use client";

import { useEffect } from "react";

export function MarketingBodyClass() {
  useEffect(() => {
    document.body.classList.add("marketing-page");
    return () => {
      document.body.classList.remove("marketing-page");
    };
  }, []);

  return null;
}
