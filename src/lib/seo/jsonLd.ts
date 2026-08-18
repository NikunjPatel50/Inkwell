import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { absoluteUrl } from "./metadata";
import type { FaqItem } from "./pricingContent";

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function organizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/wrytesmart-logo.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/wrytesmart-logo.png`,
  };
}

export function softwareApplicationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#app`,
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "0",
        priceCurrency: "USD",
        description: "Free grammar, vocabulary, and writing practice with daily limits.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "49",
        priceCurrency: "INR",
        description: "Unlimited analysis, PTE/IELTS essay scoring, and progress tracking.",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "49",
          priceCurrency: "INR",
          unitText: "MONTH",
        },
      },
    ],
    description: SITE_DESCRIPTION,
    url: `${siteUrl}/app`,
  };
}

export function reviewJsonLd(
  reviews: { quote: string; author: string; role: string }[],
) {
  return reviews.map((review) => ({
    "@type": "Review",
    reviewBody: review.quote,
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5",
      bestRating: "5",
    },
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "EducationalApplication",
    },
  }));
}

export function faqPageJsonLd(faqs: FaqItem[] | { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function learningResourceJsonLd(options: {
  name: string;
  description: string;
  path: string;
  resourceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    learningResourceType: options.resourceType ?? "lesson",
    inLanguage: "en",
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function aggregateRatingJsonLd(reviewCount: number) {
  return {
    "@type": "AggregateRating",
    ratingValue: "5",
    bestRating: "5",
    worstRating: "1",
    ratingCount: String(reviewCount),
    reviewCount: String(reviewCount),
  };
}

export function homepageGraphJsonLd(
  reviews: { quote: string; author: string; role: string }[],
  pricingFaqs: FaqItem[] | { question: string; answer: string }[],
) {
  const siteUrl = getSiteUrl();
  const app = softwareApplicationJsonLd();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      organizationJsonLd(),
      {
        ...app,
        aggregateRating: aggregateRatingJsonLd(reviews.length),
      },
      faqPageJsonLd(pricingFaqs),
      ...reviewJsonLd(reviews),
    ],
  };
}
