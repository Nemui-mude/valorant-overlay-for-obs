import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { SupportedLocale } from "../locales";
import { t } from "./i18n";
import path from "node:path";
import { isDev } from "./util";
import { serveStatic } from "hono/bun";
import OverlayData from "./overlayData";

export default function createServer(apiKey: string, agentVisible: boolean) {
  if (!apiKey) {
    throw new Error(t("message.server.error.noApiKey"));
  }

  const app = new Hono();
  app.use("*", cors());

  const DateLogger = (message: string) =>
    console.log(`[${new Date().toLocaleString()}] ${message}`);
  app.use(logger(DateLogger));

  app.get("/test", (c) => {
    const lang = c.req.query("lang") as SupportedLocale | undefined;
    return c.text(t("message.server.error.fetch", {}, lang));
  });

  app.get(
    "/api/overlay/:platform{pc|console}/:region/:name/:tag",
    async (c) => {
      const lang = c.req.query("lang") as SupportedLocale | undefined;
      const platform = c.req.param("platform");
      const region = c.req.param("region");
      const name = decodeURIComponent(c.req.param("name"));
      const tag = decodeURIComponent(c.req.param("tag"));

      if (region === "null" || name === "null" || tag === "null") {
        return c.json(
          {
            status: 400,
            message: t("message.client.error.invalidURL", {}, lang),
          },
          400,
        );
      }

      const overlayData = new OverlayData(apiKey);
      const data = await overlayData.fetchOverlayData(
        region,
        name,
        tag,
        platform,
        lang,
      );

      return c.json(
        {
          status: 200,
          agentVisible,
          ui: {
            recentMatchesTitle: t("ui.match.recentTitle", {}, lang),
            winSuffix: t("ui.match.win", {}, lang),
            loseSuffix: t("ui.match.lose", {}, lang),
          },
          ...data,
        },
        200,
      );
    },
  );

  const staticDir = isDev
    ? "./public"
    : path.join(path.dirname(process.execPath), "public");

  app.use("/*", serveStatic({ root: staticDir }));

  return app;
}
