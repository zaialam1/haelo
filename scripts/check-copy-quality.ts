/**
 * Lightweight Halo copy-quality checks.
 *
 * Usage:
 *   npm run check:copy
 *
 * Check 1 (errors): em dashes in user-facing source/content files
 * Check 2 (warnings): known generic / AI-sounding phrases
 * Check 3 (errors): brand voice Cursor rule + guide present
 *
 * Developer comments, DESIGN.md headers, brandVoice dash-stripping code,
 * and dependencies are excluded where appropriate.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SCAN_DIRS = ["src", "docs"] as const;

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "coverage",
]);

const SKIP_FILE_SUBSTRINGS = [
  "style-lab",
  "package-lock",
  "tsbuildinfo",
];

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".md",
  ".mdx",
  ".json",
]);

/** Phrases that usually signal generic AI / wellness copy. Warnings only. */
const GENERIC_PHRASES: readonly string[] = [
  "your journey starts here",
  "unlock your potential",
  "embrace your authentic self",
  "take a moment to reflect",
  "every step is progress",
  "find your voice",
  "your voice matters",
  "every voice deserves to be heard",
  "discover your authentic self",
  "embrace the journey",
  "there's no right or wrong answer",
  "you showed incredible courage",
  "thank you for sharing",
  "what a powerful reflection",
  "you're doing amazing",
  "this is a safe space",
  "growth takes time",
  "as you continue your journey",
  "one step at a time",
  "you have the power to",
  "this is an opportunity to grow",
];

type Finding = {
  severity: "error" | "warning";
  file: string;
  line: number;
  message: string;
};

function shouldSkipFile(rel: string): boolean {
  const lower = rel.toLowerCase();
  return SKIP_FILE_SUBSTRINGS.some((s) => lower.includes(s));
}

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    const rel = path.relative(ROOT, full);
    if (shouldSkipFile(rel)) continue;
    out.push(full);
  }
}

function isCommentOrDevOnlyLine(file: string, line: string): boolean {
  const trimmed = line.trim();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("{/*")
  ) {
    return true;
  }

  const rel = path.relative(ROOT, file);

  // brandVoice intentionally mentions / strips em dashes
  if (rel.includes(`${path.sep}ai${path.sep}brandVoice.ts`)) {
    if (/[—–]/.test(line) && !/(['"`]).*\1/.test(line.replace(/BRAND_VOICE_PROMPT[\s\S]*/, ""))) {
      // Allow regex and replacement code; still flag string literals that are user-facing examples inside the prompt constant (those are anti-examples, OK)
      if (line.includes(".replace(") || line.includes("test(") || line.includes("/[—–]/")) {
        return true;
      }
    }
  }

  // DESIGN.md uses em dashes in section titles (developer-facing design system)
  if (rel === path.join("DESIGN.md") || rel.endsWith(`${path.sep}DESIGN.md`)) {
    return true;
  }

  // Developer docs / instructions (not product UI)
  if (
    rel === "AGENTS.md" ||
    rel === "CLAUDE.md" ||
    rel === "README.md" ||
    (rel.startsWith(`docs${path.sep}`) &&
      !rel.endsWith(`${path.sep}HAELO_BRAND_VOICE.md`) &&
      rel !== path.join("docs", "HAELO_BRAND_VOICE.md"))
  ) {
    return true;
  }

  // Evolution intent strings are internal art direction, not shown in UI
  if (rel.includes(`${path.sep}planets${path.sep}evolution.ts`)) {
    return true;
  }

  // Console / migration hints
  if (
    trimmed.includes("console.") ||
    trimmed.includes("Apply migration") ||
    trimmed.includes("missing —")
  ) {
    return true;
  }

  return false;
}

function checkEmDashes(file: string, findings: Finding[]): void {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const rel = path.relative(ROOT, file);

  // Brand guide, Cursor rule, and this script document the character on purpose.
  // Other docs/ files are developer setup notes, not product UI.
  if (
    rel === path.join("docs", "HAELO_BRAND_VOICE.md") ||
    rel.startsWith(`docs${path.sep}`) ||
    rel === path.join("scripts", "check-copy-quality.ts") ||
    rel === path.join(".cursor", "rules", "haelo-brand-voice.mdc")
  ) {
    return;
  }

  lines.forEach((line, idx) => {
    if (!line.includes("—")) return;
    if (isCommentOrDevOnlyLine(file, line)) return;

    // Allow the character inside brandVoice prompt anti-examples and tidy helpers
    if (rel.includes(`${path.sep}ai${path.sep}brandVoice.ts`)) return;

    findings.push({
      severity: "error",
      file: rel,
      line: idx + 1,
      message: `Em dash in user-facing copy: ${line.trim().slice(0, 100)}`,
    });
  });
}

function checkGenericPhrases(file: string, findings: Finding[]): void {
  const rel = path.relative(ROOT, file);
  if (
    rel === path.join("docs", "HAELO_BRAND_VOICE.md") ||
    rel === path.join("scripts", "check-copy-quality.ts") ||
    rel.includes(`${path.sep}ai${path.sep}brandVoice.ts`)
  ) {
    // Guides and anti-example lists intentionally contain these phrases
    return;
  }

  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (isCommentOrDevOnlyLine(file, line)) return;
    const lower = line.toLowerCase();
    for (const phrase of GENERIC_PHRASES) {
      if (lower.includes(phrase)) {
        findings.push({
          severity: "warning",
          file: rel,
          line: idx + 1,
          message: `Generic AI-sounding phrase "${phrase}"`,
        });
      }
    }
  });
}

function checkBrandRulePresent(findings: Finding[]): void {
  const guide = path.join(ROOT, "docs", "HAELO_BRAND_VOICE.md");
  const rule = path.join(ROOT, ".cursor", "rules", "haelo-brand-voice.mdc");
  const runtime = path.join(ROOT, "src", "lib", "ai", "brandVoice.ts");

  if (!fs.existsSync(guide)) {
    findings.push({
      severity: "error",
      file: "docs/HAELO_BRAND_VOICE.md",
      line: 1,
      message: "Missing brand voice guide",
    });
  }
  if (!fs.existsSync(rule)) {
    findings.push({
      severity: "error",
      file: ".cursor/rules/haelo-brand-voice.mdc",
      line: 1,
      message: "Missing Cursor brand voice rule",
    });
  } else {
    const ruleText = fs.readFileSync(rule, "utf8");
    if (!ruleText.includes("docs/HAELO_BRAND_VOICE.md")) {
      findings.push({
        severity: "error",
        file: ".cursor/rules/haelo-brand-voice.mdc",
        line: 1,
        message: "Cursor rule must reference docs/HAELO_BRAND_VOICE.md",
      });
    }
  }
  if (!fs.existsSync(runtime)) {
    findings.push({
      severity: "error",
      file: "src/lib/ai/brandVoice.ts",
      line: 1,
      message: "Missing runtime brandVoice helper",
    });
  }
}

function main(): void {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    walk(path.join(ROOT, dir), files);
  }

  const findings: Finding[] = [];
  checkBrandRulePresent(findings);

  for (const file of files) {
    checkEmDashes(file, findings);
    checkGenericPhrases(file, findings);
  }

  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");

  for (const f of [...errors, ...warnings]) {
    const tag = f.severity === "error" ? "ERROR" : "WARN";
    console.log(`${tag} ${f.file}:${f.line}: ${f.message}`);
  }

  console.log(
    `\nCopy check: ${errors.length} error(s), ${warnings.length} warning(s) across ${files.length} files.`,
  );
  console.log(
    "Em dashes are errors. Generic phrases are warnings (review, don't blindly delete legitimate uses).",
  );

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
