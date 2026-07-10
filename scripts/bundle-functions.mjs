import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundledDir = join(root, "functions", "bundled");
mkdirSync(bundledDir, { recursive: true });

const bundles = [
  { name: "analyze-text", shared: ["cors", "auth", "categories", "groq"] },
  { name: "check-correction", shared: ["cors", "auth", "groq"] },
  { name: "get-history", shared: ["cors", "auth"] },
  { name: "get-vocabulary", shared: ["cors", "auth"] },
  { name: "generate-duel-sentence", shared: ["cors", "creative"] },
  { name: "judge-duel", shared: ["cors", "creative"] },
  { name: "rewrite-with-emotion", shared: ["cors", "creative"] },
  { name: "generate-build-it", shared: ["cors", "learn"] },
  { name: "generate-spot-error", shared: ["cors", "learn"] },
  { name: "generate-complete-it", shared: ["cors", "learn"] },
  { name: "check-complete-it", shared: ["cors", "learn"] },
  { name: "get-practiced-skills", shared: ["cors", "auth"] },
  { name: "upsert-practiced-skill", shared: ["cors", "auth"] },
  { name: "coach-evaluate", shared: ["cors", "coach"] },
  { name: "grammar-learning", shared: ["cors", "grammarLearning"] },
  { name: "vocabulary-learning", shared: ["cors", "vocabularyLearning"] },
];

function stripImports(content) {
  return content
    .replace(/^import\s+(?:type\s+)?[\s\S]*?from\s+['"].*['"];?\s*/gm, "")
    .trim();
}

const npmImports = `import { createClient } from "npm:@insforge/sdk@latest";\n\n`;

for (const bundle of bundles) {
  const parts = bundle.shared.map((file) => {
    const content = readFileSync(join(root, "functions", "_shared", `${file}.ts`), "utf8");
    return `// shared: ${file}\n${stripImports(content)}`;
  });

  const main = stripImports(readFileSync(join(root, "functions", `${bundle.name}.ts`), "utf8"));

  writeFileSync(
    join(bundledDir, `${bundle.name}.ts`),
    `${npmImports}${parts.join("\n\n")}\n\n// handler\n${main}\n`,
    "utf8",
  );

  console.log(`Bundled ${bundle.name}.ts`);
}
