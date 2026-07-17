import type { Metadata } from "next";
import { JsonLdScript } from "@/components/marketing/JsonLdScript";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PricingSection } from "@/components/marketing/PricingSection";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { PRICING_FAQS } from "@/lib/seo/pricingContent";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing — Starter Free & Pro Plans",
  description:
    "Compare Wrytesmart Starter (free) and Pro (₹49/month). Get grammar, vocabulary, and writing practice free — upgrade for PTE/IELTS essay scoring, unlimited analysis, and progress tracking.",
  path: "/pricing",
  keywords: [
    "Wrytesmart pricing",
    "PTE writing subscription",
    "IELTS essay scoring",
    "English learning plans",
  ],
});

export default function PricingPage() {
  return (
    <MarketingShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Pricing", href: "/pricing" },
      ]}
    >
      <JsonLdScript
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
          faqPageJsonLd(PRICING_FAQS),
        ]}
      />
      <PricingSection id="pricing" variant="page" showFaq />
      <MarketingCta
        title="Start with Starter — upgrade when you're ready"
        lead="Create a free account to practise grammar, vocabulary, and writing. Move to Pro when you need full exam scoring and unlimited analysis."
        primaryLabel="Get started free"
        secondaryLabel="Compare plans above"
        secondaryHref="/pricing#pricing"
      />
    </MarketingShell>
  );
}
