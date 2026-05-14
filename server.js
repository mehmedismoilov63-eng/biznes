const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const logPath = path.join(root, ".server.err");

function logError(error) {
  const message = error && error.stack ? error.stack : String(error);
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
}

process.on("uncaughtException", (error) => {
  logError(error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logError(error);
  process.exit(1);
});

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon",
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const cleanPath = pathname === "/" ? "/Biznesjon.html" : pathname;
  const resolved = path.resolve(root, `.${cleanPath}`);

  if (!resolved.startsWith(root)) {
    return null;
  }

  return resolved;
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url || "/");

  if (!filePath) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "content-type": "text/plain; charset=utf-8",
      });
      res.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(content);
  });
});

server.on("error", logError);

server.listen(port, "127.0.0.1", () => {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] listening http://127.0.0.1:${port}\n`);
  if (process.stdout.isTTY) {
    console.log(`Biznesjon skeleton is running at http://localhost:${port}`);
  }
});
