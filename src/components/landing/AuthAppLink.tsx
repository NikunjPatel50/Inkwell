"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { resolveAuthDestination } from "../../lib/authNavigation";
import styles from "./LandingPage.module.css";

interface AuthAppLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function AuthAppLink({ href, className, children }: AuthAppLinkProps) {
  const router = useRouter();
  const destination = resolveAuthDestination(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push(destination);
  };

  const handleMouseEnter = () => {
    router.prefetch(destination);
  };

  return (
    <a href={destination} className={className} onClick={handleClick} onMouseEnter={handleMouseEnter}>
      {children}
    </a>
  );
}

/** Single auth-aware nav for the landing header — avoids many parallel auth hooks. */
export function LandingHeaderNav({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const router = useRouter();

  return (
    <nav className={styles.nav} aria-label="Tools">
      {items.map((item) => {
        const destination = resolveAuthDestination(item.href);
        return (
          <a
            key={item.label}
            href={destination}
            className={styles.navLink}
            onClick={(event) => {
              event.preventDefault();
              router.push(destination);
            }}
            onMouseEnter={() => router.prefetch(destination)}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
