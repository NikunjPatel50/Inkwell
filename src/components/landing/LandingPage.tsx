import Link from "next/link";
import { AppBrand } from "../AppBrand";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "../../lib/site";
import styles from "./LandingPage.module.css";

const FEATURES = [
  {
    icon: "L",
    title: "Learn",
    text: "Adaptive curriculum with build-it, spot-the-error, and complete-it exercises that target your weak spots.",
  },
  {
    icon: "G",
    title: "Grammar",
    text: "Forty topics across parts of speech, tenses, punctuation, and common mistakes — taught through real sentences.",
  },
  {
    icon: "V",
    title: "Vocabulary",
    text: "Search any word, explore curated collections, and unlock four depth levels from definition to etymology.",
  },
  {
    icon: "W",
    title: "Write",
    text: "Paste your draft and get register scoring, error teaching notes, and simple-to-advanced rewrites.",
  },
  {
    icon: "C",
    title: "Coach",
    text: "Structured essay coaching with step-by-step feedback for academic and exam-style writing.",
  },
  {
    icon: "+",
    title: "Creative",
    text: "Word duels, emotion rewrites, and playful drills that keep practice engaging.",
  },
];

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <AppBrand size="header" href="/" />
        <nav className={styles.nav} aria-label="Primary">
          <a href="#features" className={styles.navLink}>
            Features
          </a>
          <a href="#how-it-works" className={styles.navLink}>
            How it works
          </a>
          <Link href="/login" className={styles.navLink}>
            Sign in
          </Link>
          <Link href="/login" className={styles.primaryBtn}>
            Get started free
          </Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div>
            <p className={styles.eyebrow}>In-context English learning</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Write better English — one real sentence at a time
            </h1>
            <p className={styles.heroLead}>
              {SITE_NAME} is a writing workspace for school students, exam prep, and
              professionals. Grammar rules, vocabulary, and feedback all happen inside
              sentences you read, edit, and practice — never in isolation.
            </p>
            <div className={styles.heroActions}>
              <Link href="/login" className={styles.primaryBtn}>
                Start practicing free
              </Link>
              <Link href="/app" className={styles.secondaryBtn}>
                Open workspace
              </Link>
            </div>
            <p className={styles.heroNote}>
              Free to start · Works in your browser · Progress saved when you sign in
            </p>
          </div>

          <aside className={styles.heroPanel} aria-label="Example feedback">
            <p className={styles.sampleLabel}>See it in action</p>
            <p className={styles.sampleSentence}>
              The committee{" "}
              <span className={styles.highlight}>have</span> approved the revised draft.
            </p>
            <p className={styles.sampleFeedback}>
              <strong>Subject–verb agreement:</strong> &ldquo;Committee&rdquo; acts as a
              single unit here — use <em>has</em>, not <em>have</em>. Every rule is shown
              inside a sentence you can fix immediately.
            </p>
          </aside>
        </section>

        <section id="features" className={styles.section} aria-labelledby="features-heading">
          <div className={styles.sectionHeader}>
            <h2 id="features-heading" className={styles.sectionTitle}>
              Everything you need to grow as a writer
            </h2>
            <p className={styles.sectionLead}>
              {SITE_TAGLINE}. One calm workspace for lessons, drills, analysis, and long-term
              progress tracking.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIcon} aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className={styles.section}
          aria-labelledby="how-heading"
        >
          <div className={styles.sectionHeader}>
            <h2 id="how-heading" className={styles.sectionTitle}>
              How it works
            </h2>
            <p className={styles.sectionLead}>
              A simple loop: write, learn from feedback, drill weak skills, and return
              stronger.
            </p>
          </div>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum}>STEP 1</span>
              <h3 className={styles.stepTitle}>Write or paste your text</h3>
              <p className={styles.stepText}>
                Analyse tone, catch errors, and see clearer rewrites at three levels of
                sophistication.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>STEP 2</span>
              <h3 className={styles.stepTitle}>Learn what to fix</h3>
              <p className={styles.stepText}>
                Teaching notes explain the principle behind each issue — not just what is
                wrong.
              </p>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>STEP 3</span>
              <h3 className={styles.stepTitle}>Practice in context</h3>
              <p className={styles.stepText}>
                Grammar topics, vocabulary depth, and adaptive exercises reinforce the same
                skills in fresh sentences.
              </p>
            </li>
          </ol>
        </section>

        <section className={styles.ctaBand} aria-labelledby="cta-heading">
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Ready to write with confidence?
          </h2>
          <p className={styles.ctaLead}>{SITE_DESCRIPTION}</p>
          <Link href="/login" className={styles.primaryBtn}>
            Create your free account
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} {SITE_NAME}. Built for learners at every level.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/app" className={styles.footerLink}>
              Workspace
            </Link>
            <Link href="/login" className={styles.footerLink}>
              Sign in
            </Link>
            <a href="#features" className={styles.footerLink}>
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
