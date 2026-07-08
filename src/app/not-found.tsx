import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Page not found</h1>
      <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
        The page you requested does not exist.
      </p>
      <Link href="/">Back to workspace</Link>
    </main>
  );
}
