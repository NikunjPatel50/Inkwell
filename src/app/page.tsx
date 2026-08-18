import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { homepageGraphJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { HOME_META_DESCRIPTION } from "@/lib/seo/descriptions";
import { PRICING_FAQS } from "@/lib/seo/pricingContent";
import { MARKETING_TESTIMONIALS } from "@/lib/seo/testimonials";
import { getGoogleSiteVerification, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const googleVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: HOME_META_DESCRIPTION,
    path: "/",
  }),
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
          __html: JSON.stringify(
            homepageGraphJsonLd([...MARKETING_TESTIMONIALS], PRICING_FAQS),
          ),
        }}
      />
      <LandingPage />
    </>
  );
}
