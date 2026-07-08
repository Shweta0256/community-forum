import { createServer, type IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { app } from "./app";
import { ensureSchema } from "./db/client";

const port = Number(process.env.PORT ?? 4000);

function applyCorsHeaders(res: import("node:http").ServerResponse) {
  res.setHeader("access-control-allow-origin", "http://localhost:3001");
  res.setHeader("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type,x-user-id,x-role,x-locale");
}

function toRequest(req: IncomingMessage) {
  const protocol = "http";
  const host = req.headers.host ?? `localhost:${port}`;
  const url = new URL(req.url ?? "/", `${protocol}://${host}`);
  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : (Readable.toWeb(req) as BodyInit);
  const headers = Object.entries(req.headers).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((entry) => [key, entry] as [string, string]);
    }

    return value ? [[key, value] as [string, string]] : [];
  });

  return new Request(
    url,
    {
      method: req.method,
      headers: new Headers(headers),
      body,
      ...(body ? ({ duplex: "half" } as const) : {})
    } as RequestInit
  );
}

ensureSchema();

createServer(async (req, res) => {
  applyCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const response = await app.fetch(toRequest(req));

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "access-control-allow-origin") {
      return;
    }

    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    res.write(value);
  }

  res.end();
}).listen(port, () => {
  console.log(`Community Forum API running on http://localhost:${port}`);
});
