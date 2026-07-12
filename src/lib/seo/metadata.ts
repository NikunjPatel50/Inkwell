import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
}: PageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: `${siteUrl}/wrytesmart-logo.png`,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${siteUrl}/wrytesmart-logo.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function absoluteUrl(path: string): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
