import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";

let application: Promise<FastifyInstance> | undefined;

async function getApplication(): Promise<FastifyInstance> {
  if (!application) {
    application = (async () => {
      const [{ buildApp }, { loadConfig }] = await Promise.all([
        import("../apps/api/src/app.js"),
        import("../apps/api/src/config.js")
      ]);
      const app = await buildApp(loadConfig());
      await app.ready();
      return app;
    })();
  }

  try {
    return await application;
  } catch (error) {
    application = undefined;
    throw error;
  }
}

/**
 * Vercel functions must live under the root `api/` directory. Keeping this
 * entry point self-contained ensures the serverless bundler can trace the
 * API application and its shared workspace dependencies.
 */
export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const app = await getApplication();
    app.server.emit("request", request, response);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown startup error";
    console.error({ err: reason }, "API startup failed");
    if (!response.headersSent) {
      response.writeHead(500, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      response.end(JSON.stringify({ error: "SERVICE_UNAVAILABLE" }));
    }
  }
}
