import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { homepageGraphJsonLd } from "@/lib/seo/jsonLd";
import { MARKETING_TESTIMONIALS } from "@/lib/seo/testimonials";
import {
  getGoogleSiteVerification,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";

const siteUrl = getSiteUrl();
const googleVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — English Writing Practice`,
    description: SITE_DESCRIPTION,
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
    title: `${SITE_NAME} — English Writing Practice`,
    description: SITE_DESCRIPTION,
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
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageGraphJsonLd([...MARKETING_TESTIMONIALS])),
        }}
      />
      <LandingPage />
    </>
  );
}
