import { t } from "./lib/i18n";
import loadConfig, { isDev } from "./lib/util";
import createServer from "./lib/server";

if (isDev) {
  console.log(t("message.server.log.devModeEnabled"));
}

const { PORT, HENRIK_API_KEY, AGENT_VISIBLE } = loadConfig();

const app = createServer(HENRIK_API_KEY, AGENT_VISIBLE);

export default {
  port: PORT,
  fetch: app.fetch,
};
