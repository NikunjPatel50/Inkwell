import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { absoluteUrl } from "./metadata";

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

export function softwareApplicationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#app`,
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
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

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    learningResourceType: "grammar lesson",
    inLanguage: "en",
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}

export function homepageGraphJsonLd(
  reviews: { quote: string; author: string; role: string }[],
) {
  const siteUrl = getSiteUrl();
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
      },
      softwareApplicationJsonLd(),
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: `${siteUrl}/wrytesmart-logo.png`,
      },
      ...reviewJsonLd(reviews),
    ],
  };
}
