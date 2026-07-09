import { Glob } from "bun";
import fs from "node:fs";

const glob = new Glob("public/**/*.ts");

async function buildClient() {
  const entrypoints = Array.from(glob.scanSync()).map((p) =>
    p.replace(/\\/g, "/"),
  );
  if (entrypoints.length === 0) {
    console.log("⚠️ No TypeScript entry points found in public/");
    return;
  }

  console.log(`📦 Bundling client: ${entrypoints.join(", ")}`);

  const result = await Bun.build({
    entrypoints,
    outdir: "public",
    root: "public",
  });

  if (!result.success) {
    console.error("❌ Client build failed");
    for (const message of result.logs) {
      console.error(message);
    }
  } else {
    console.log("✅ Client build successful");
  }
}

const isWatch = Bun.argv.includes("--watch");

await buildClient();

if (isWatch) {
  console.log("👀 Watching public/ directory for changes...");
  fs.watch("public", { recursive: true }, async (eventType, filename) => {
    if (filename && filename.endsWith(".ts")) {
      console.log(`file changed: ${filename}. Rebuilding...`);
      await buildClient();
    }
  });
}
