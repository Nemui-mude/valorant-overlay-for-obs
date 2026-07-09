import fs from "node:fs";
import { generateLocaleBarrel } from "./build-i18n";
import { $ } from "bun";

const BUILD_VERSION = "1.0.0"; // TODO: update version

const DIST_STATICS = "dist/public";
const RELEASE_DIR = "release";

//clean dist folder
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync(DIST_STATICS, { recursive: true });
if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR);
}

// generate locale barrel
console.log("🌐 Generate locale barrel...");
generateLocaleBarrel();
console.log("✅ Complete: Generate locale barrel");

// compiling server
try {
  console.log("📦 Compile server...");
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    compile: {
      target: "bun-windows-x64",
      outfile: "./dist/valorant-overlay.exe",
    },
    define: {
      BUILD_VERSION: JSON.stringify(BUILD_VERSION),
    },
  });
  console.log("✅ Complete: Compile server");
} catch (error) {
  console.log(error);
}

// config
console.log("📁 Copy config.json");
const configDest = "dist/config.json";
fs.copyFileSync("config.sample.json", configDest);
console.log("✅ Complete: Copy config.json");

//static files
console.log("📁 Copy static files");
await $`bun build/build-client.ts`;
fs.cpSync("public/", `${DIST_STATICS}/`, {
  recursive: true,
  filter: (src) => !src.endsWith(".ts") && !src.endsWith(".jpg"),
});
console.log("✅ Complete: Copy static files");

//compress dist to zip
console.log("📁 Compressing dist to zip...");
await Bun.spawn([
  "powershell",
  "-NoProfile",
  "-Command",
  `Compress-Archive -Path "dist/*" -DestinationPath "release/valorant-overlay-for-obs-${BUILD_VERSION}.zip" -Force`,
]);
console.log("✅ Complete: Compressing dist to zip");
