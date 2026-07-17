export const PRICING_NAV = { label: "Pricing", href: "/pricing" } as const;

export interface PricingTier {
  id: "starter" | "pro";
  name: string;
  price: string;
  priceSuffix?: string;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    ctaLabel: "Get started free",
    ctaHref: "/login",
    features: [
      "40+ grammar topics, fully browsable",
      "Vocabulary hub access",
      "Adaptive Learn drills (up to 10/day)",
      "Write workspace (short text analysis, Simple rewrites)",
      "Weekly guided essay coaching session",
      "Works in your browser, no install",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹49",
    priceSuffix: "/month",
    badge: "Most popular",
    ctaLabel: "Upgrade to Pro",
    ctaHref: "/login",
    featured: true,
    features: [
      "Everything in Starter, plus:",
      "Full PTE/IELTS essay scoring — official 7-trait rubric, score out of 26, and band estimate",
      "AI-powered \"Improve my essay\" — get a rewritten, re-scored version targeting your weakest traits",
      "Unlimited Write workspace analysis — no length or daily caps, all 3 rewrite levels (Simple, Intermediate, Advanced)",
      "Progress dashboard — readiness score, trait breakdown, weak-pattern tracking, and practice streaks",
      "Unlimited adaptive Learn drills",
      "Essay history — save and revisit past analyses and improvements",
      "Priority AI scoring (skip the queue at peak times)",
    ],
  },
];

export const PRICING_FAQS = [
  {
    question: "What's the difference between Starter and Pro?",
    answer:
      "Starter gives you full access to grammar, vocabulary, and adaptive Learn drills with sensible daily limits, plus a Write workspace for shorter analyses and Simple rewrites. Pro removes those caps and unlocks exam-ready essay scoring (PTE/IELTS 7-trait rubric), AI essay improvements, the progress dashboard, saved essay history, and priority AI scoring.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Pro is a monthly subscription you can cancel at any time from your account settings. You keep access through the end of your billing period, then return to Starter limits automatically — no cancellation fees.",
  },
  {
    question: "Does Pro include PTE and IELTS scoring?",
    answer:
      "Yes. Pro includes full PTE Academic essay scoring with the official 7-trait rubric (out of 26), band estimates, trait breakdowns, and AI-powered essay improvements. The same Write workspace also supports IELTS-style essay analysis and coaching workflows.",
  },
];
