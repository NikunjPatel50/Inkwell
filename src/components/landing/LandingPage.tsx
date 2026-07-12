import Link from "next/link";
import { AppBrand } from "../AppBrand";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "../../lib/site";
import { MARKETING_NAV } from "../../lib/seo/publicRoutes";
import { MARKETING_TESTIMONIALS } from "../../lib/seo/testimonials";
import { MarketingBodyClass } from "./MarketingBodyClass";
import { HeroWorkspace } from "./HeroWorkspace";
import styles from "./LandingPage.module.css";

const NAV_TOOLS = [...MARKETING_NAV];

const SHOWCASES = [
  {
    id: "learn",
    eyebrow: "Learn",
    title: "Practice skills that stick, inside real sentences",
    lead: "Adaptive exercises target your weak spots with build-it, spot-the-error, and complete-it drills — never disconnected worksheets.",
    cta: "Start learning",
    href: "/learn",
    bullets: ["Personalised skill feed", "Instant teaching notes", "Progress you can track"],
    visual: "learn" as const,
  },
  {
    id: "write",
    eyebrow: "Write",
    title: "Write like you mean it, then sharpen every draft",
    lead: "Paste any paragraph and get register scoring, clear error explanations, and rewrites at three levels of sophistication.",
    cta: "Open writing workspace",
    href: "/write",
    bullets: ["Tone and register analysis", "Grammar teaching in context", "Simple to advanced rewrites"],
    visual: "write" as const,
  },
  {
    id: "coach",
    eyebrow: "Coach",
    title: "Get essay coaching that explains the why",
    lead: "Structured coaching walks you through academic and exam-style writing with step-by-step feedback you can apply immediately.",
    cta: "Try the coach",
    href: "/coach",
    bullets: ["Exam-ready structure", "Actionable next steps", "Built for students and pros"],
    visual: "coach" as const,
  },
];

const TOOL_GROUPS = [
  {
    title: "Writing",
    tools: [
      { name: "Write workspace", desc: "Analyse drafts with feedback", href: "/write" },
      { name: "AI Writing Coach", desc: "Guided essay coaching", href: "/coach" },
      { name: "Creative drills", desc: "Playful rewrites and games", href: "/creative" },
    ],
  },
  {
    title: "Learning",
    tools: [
      { name: "Adaptive Learn", desc: "Exercises for your weak spots", href: "/learn" },
      { name: "Grammar topics", desc: "40 topics through real sentences", href: "/grammar" },
      { name: "Vocabulary hub", desc: "Words, collections, and depth", href: "/vocabulary" },
    ],
  },
  {
    title: "Exam prep",
    tools: [
      { name: "IELTS writing practice", desc: "Essays, grammar, and coaching", href: "/ielts-writing-practice" },
      { name: "PTE writing practice", desc: "Summaries, essays, and feedback", href: "/pte-writing-practice" },
      { name: "Sign in to save progress", desc: "Free account, works in browser", href: "/login" },
    ],
  },
];

const STATS = [
  { value: "40+", label: "Grammar topics" },
  { value: "4", label: "Vocabulary depth levels" },
  { value: "3", label: "Rewrite sophistication levels" },
  { value: "Free", label: "To start practicing" },
];

const AUDIENCES = [
  {
    title: "Students",
    text: "Prepare for exams, essays, and presentations with lessons that show rules inside sentences you can fix right away.",
  },
  {
    title: "Professionals",
    text: "Polish emails, reports, and pitches with register-aware feedback that keeps your voice while improving clarity.",
  },
  {
    title: "Exam prep",
    text: "Build confidence for PTE, IELTS, and academic writing with coaching structured for high-stakes tasks.",
  },
  {
    title: "Self-learners",
    text: "Explore grammar, vocabulary, and creative drills at your own pace in one calm browser workspace.",
  },
];

const TESTIMONIALS = [...MARKETING_TESTIMONIALS];

function ShowcaseVisual({ type }: { type: "learn" | "write" | "coach" }) {
  if (type === "learn") {
    return (
      <div className={styles.showcaseCard}>
        <p className={styles.showcaseCardLabel}>Adaptive exercise</p>
        <p className={styles.showcaseCardPrompt}>
          Fix the error: She <span className={styles.showcaseHighlight}>don&apos;t</span> agree with
          the proposal.
        </p>
        <div className={styles.showcaseCardAnswer}>doesn&apos;t</div>
        <p className={styles.showcaseCardNote}>
          Third-person singular verbs take <em>does</em> in the present tense.
        </p>
      </div>
    );
  }

  if (type === "write") {
    return (
      <div className={styles.showcaseCard}>
        <p className={styles.showcaseCardLabel}>Writing workspace</p>
        <p className={styles.showcaseCardPrompt}>
          The committee <span className={styles.showcaseHighlight}>have</span> approved the revised
          draft.
        </p>
        <div className={styles.showcaseRewrite}>
          <span className={styles.showcaseRewriteTag}>Simple</span>
          The committee has approved the revised draft.
        </div>
        <div className={styles.showcaseRewrite}>
          <span className={styles.showcaseRewriteTag}>Advanced</span>
          The committee has endorsed the amended draft.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.showcaseCard}>
      <p className={styles.showcaseCardLabel}>Essay coach</p>
      <ol className={styles.showcaseSteps}>
        <li>Clarify your thesis in one sentence</li>
        <li>Strengthen your topic sentence</li>
        <li>Add evidence that supports the claim</li>
      </ol>
      <p className={styles.showcaseCardNote}>
        Step-by-step guidance for academic and exam-style essays.
      </p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className={styles.page}>
      <MarketingBodyClass />
      <header className={styles.header}>
        <AppBrand size="header" href="/" />
        <nav className={styles.nav} aria-label="Tools">
          {NAV_TOOLS.map((item) => (
            <Link key={item.label} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <Link href="/login" className={styles.navLink}>
            Sign in
          </Link>
          <Link href="/login" className={styles.primaryBtn}>
            Get started free
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <p className={styles.heroEyebrow}>In-context English learning</p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Create stronger writing today
          </h1>
          <p className={styles.heroLead}>
            {SITE_TAGLINE}. Grammar, vocabulary, coaching, and feedback — all inside sentences you
            read, edit, and practice.
          </p>

          <HeroWorkspace />

          <p className={styles.heroNote}>
            Free to start · Works in your browser · Progress saved when you sign in
          </p>
        </section>

        <section className={styles.valueBand} aria-labelledby="value-heading">
          <div className={styles.valueInner}>
            <h2 id="value-heading" className={styles.valueTitle}>
              The only English workspace you need to improve
            </h2>
            <p className={styles.valueLead}>
              Bring your writing to life with tools that teach with you — lessons, drills, analysis,
              and coaching in one place.
            </p>
            <div className={styles.valueCards}>
              {SHOWCASES.map((item) => (
                <article key={item.id} className={styles.valueCard}>
                  <p className={styles.valueCardEyebrow}>{item.eyebrow}</p>
                  <h3 className={styles.valueCardTitle}>{item.title.split(",")[0]}</h3>
                  <p className={styles.valueCardText}>{item.lead.split(".")[0]}.</p>
                  <Link href={item.href} className={styles.valueCardLink}>
                    {item.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {SHOWCASES.map((item, index) => (
          <section
            key={item.id}
            id={index === 0 ? "features" : item.id}
            className={`${styles.showcase} ${index % 2 === 1 ? styles.showcaseReversed : ""}`}
            aria-labelledby={`${item.id}-heading`}
          >
            <div className={styles.showcaseCopy}>
              <p className={styles.showcaseEyebrow}>{item.eyebrow}</p>
              <h2 id={`${item.id}-heading`} className={styles.showcaseTitle}>
                {item.title}
              </h2>
              <p className={styles.showcaseLead}>{item.lead}</p>
              <ul className={styles.showcaseBullets}>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <Link href={item.href} className={styles.primaryBtn}>
                {item.cta}
              </Link>
            </div>
            <ShowcaseVisual type={item.visual} />
          </section>
        ))}

        <section id="tools" className={styles.toolsSection} aria-labelledby="tools-heading">
          <div className={styles.sectionIntro}>
            <h2 id="tools-heading" className={styles.sectionTitle}>
              {SITE_NAME}&apos;s suite of tools
            </h2>
            <p className={styles.sectionLead}>
              Discover everything you need to go from draft to confident — lessons, analysis, and
              practice in one workspace.
            </p>
          </div>
          <div className={styles.toolGroups}>
            {TOOL_GROUPS.map((group) => (
              <div key={group.title} className={styles.toolGroup}>
                <h3 className={styles.toolGroupTitle}>{group.title}</h3>
                <ul className={styles.toolList}>
                  {group.tools.map((tool) => (
                    <li key={tool.name}>
                      <Link href={tool.href} className={styles.toolLink}>
                        <span className={styles.toolName}>{tool.name}</span>
                        <span className={styles.toolDesc}>{tool.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.statsSection} aria-label="Platform highlights">
          <div className={styles.statsGrid}>
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className={styles.audienceSection} aria-labelledby="audience-heading">
          <div className={styles.sectionIntro}>
            <h2 id="audience-heading" className={styles.sectionTitle}>
              For those who want to write with confidence
            </h2>
            <p className={styles.sectionLead}>
              Sound like you. Learn the rules. Practice in context. {SITE_NAME} fits how you actually
              improve.
            </p>
          </div>
          <div className={styles.audienceGrid}>
            {AUDIENCES.map((audience) => (
              <article key={audience.title} className={styles.audienceCard}>
                <h3 className={styles.audienceTitle}>{audience.title}</h3>
                <p className={styles.audienceText}>{audience.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.testimonialsSection} aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className={styles.sectionTitle}>
            Why learners choose {SITE_NAME}
          </h2>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((item) => (
              <blockquote key={item.author} className={styles.testimonial}>
                <p className={styles.testimonialQuote}>&ldquo;{item.quote}&rdquo;</p>
                <footer className={styles.testimonialAuthor}>
                  <strong>{item.author}</strong>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className={styles.ctaBand} aria-labelledby="cta-heading">
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Create anything with confidence
          </h2>
          <p className={styles.ctaLead}>{SITE_DESCRIPTION}</p>
          <Link href="/login" className={styles.ctaBtn}>
            Sign up now. It&apos;s free!
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <AppBrand size="header" href="/" />
            <p className={styles.footerText}>
              English writing practice that teaches in context.
            </p>
          </div>
          <div>
            <p className={styles.footerHeading}>Tools</p>
            <div className={styles.footerLinks}>
              {NAV_TOOLS.map((item) => (
                <Link key={item.label} href={item.href} className={styles.footerLink}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className={styles.footerHeading}>Exam prep</p>
            <div className={styles.footerLinks}>
              <Link href="/ielts-writing-practice" className={styles.footerLink}>
                IELTS writing
              </Link>
              <Link href="/pte-writing-practice" className={styles.footerLink}>
                PTE writing
              </Link>
              <Link href="/login" className={styles.footerLink}>
                Get started free
              </Link>
            </div>
          </div>
          <div>
            <p className={styles.footerHeading}>Account</p>
            <div className={styles.footerLinks}>
              <Link href="/login" className={styles.footerLink}>
                Sign in
              </Link>
              <Link href="/login" className={styles.footerLink}>
                Create account
              </Link>
            </div>
          </div>
        </div>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} {SITE_NAME}. Built for learners at every level.
        </p>
      </footer>
    </div>
  );
}
