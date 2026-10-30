// build_app.mjs — Helloo is built the way Gloobal is: a concatenation.
//
// Gloobal's own bundle (its theme, dials, wordmark, avatars, flags, the
// ID chips, LoginAuthScreen, geuLens…) comes first, exactly as Gloobal
// builds it, then Helloo's modules in the order below. Imports are hoisted
// to the top and the two apps share one global scope, so every Helloo
// name is prefixed (HT, Helloo*, Hl* icons, useStateH*) to never collide.
//
//   node build_app.mjs            writes gloobal-helloo-preview/src/HellooApp.jsx
//
// GLOOBAL_ROOT points at the Gloobal checkout: ../gloobalv3 on the laptop.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const GLOOBAL_ROOT = process.env.GLOOBAL_ROOT || join(ROOT, "..", "gloobalv3");
const GLOOBAL_BUNDLE = join(GLOOBAL_ROOT, "gloobal-essentials-preview", "src", "GloobalApp.jsx");

const HELLOO_MODULES = [
  "constants/hellooTheme.jsx",
  "constants/hellooThemes.jsx",
  "components/hellooShell.jsx",
  "screens/Entry.jsx",
  "screens/Chats.jsx",
  "screens/Thread.jsx",
  "screens/Calls.jsx",
  "screens/PadMe.jsx",
  "screens/Reach.jsx",
  "screens/Broadcast.jsx",
  "screens/Money.jsx",
  "screens/Letters.jsx",
  "screens/Time.jsx",
  "HellooDemoData.jsx",
  "HellooApp.jsx"
];

function splitImports(src) {
  const imports = []; const body = [];
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^import\s+/.test(line)) {
      let block = line;
      while (!/;\s*$/.test(block) && i + 1 < lines.length) { i += 1; block += "\n" + lines[i]; }
      imports.push(block);
      continue;
    }
    // Gloobal's bundle ends with a multi-line `export { X as default };`.
    if (/^export\s+\{/.test(line)) {
      while (!/\};?\s*$/.test(lines[i]) && i + 1 < lines.length) i += 1;
      continue;
    }
    body.push(line);
  }
  return { imports, body: body.join("\n") };
}

if (!existsSync(GLOOBAL_BUNDLE)) {
  console.error(`Gloobal bundle not found at ${GLOOBAL_BUNDLE}. Run "node build_app.mjs" in the Gloobal repo first.`);
  process.exit(1);
}
const gl = splitImports(readFileSync(GLOOBAL_BUNDLE, "utf8"));
const imports = new Set(gl.imports);
const parts = [gl.body];
for (const rel of HELLOO_MODULES) {
  const { imports: im, body } = splitImports(readFileSync(join(ROOT, "frontend", rel), "utf8"));
  im.forEach((x) => imports.add(x));
  parts.push(`\n// ───── helloo: ${rel} ─────\n${body}`);
}
const out = [...imports].join("\n") + "\n" + parts.join("\n") + "\nexport { HellooRoot as default };\n";
mkdirSync(join(ROOT, "gloobal-helloo-preview", "src"), { recursive: true });
writeFileSync(join(ROOT, "gloobal-helloo-preview", "src", "HellooApp.jsx"), out);
console.log(`Helloo bundle: ${HELLOO_MODULES.length} modules on top of Gloobal, ${imports.size} imports`);
