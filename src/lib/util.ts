import fs from "node:fs";
import path from "node:path";
import { t } from "./i18n";

export const isDev = process.env.DEV_MODE === "true";

/**
 * Resolve path to file
 * @param filePath file path
 * @returns resolved path
 */
export function resolvePath(...filePath: string[]) {
  return isDev
    ? path.join(process.cwd(), "src", ...filePath)
    : path.join(path.dirname(process.execPath), ...filePath);
}

function loadConfig() {
  const configPath = isDev
    ? path.join(process.cwd(), "config.json")
    : path.join(path.dirname(process.execPath), "config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      t("message.error.configNotFound", { configPath: configPath }),
    );
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  return config;
}

export default loadConfig;
