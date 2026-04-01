const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5500;
const USE_NGROK = process.argv.includes("--ngrok");
const ROOT_DIR = __dirname;
const SETTINGS_FILE_PATH = path.join(ROOT_DIR, "app-settings.json");
const OVERVIEW_FILE_PATH = path.join(ROOT_DIR, "overview.json");
const OVERVIEW_MAX_ENTRIES = 5000;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function sendFile(filePath, response) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end(error.code === "ENOENT" ? "Not found" : "Internal server error");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `localhost:${PORT}`}`);
  const requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;

  if (requestUrl.pathname === "/api/settings") {
    if (request.method === "GET") {
      fs.readFile(SETTINGS_FILE_PATH, "utf8", (error, content) => {
        if (error) {
          if (error.code === "ENOENT") {
            sendJson(response, 200, {});
            return;
          }

          sendJson(response, 500, { error: "Failed to read settings." });
          return;
        }

        try {
          sendJson(response, 200, JSON.parse(content));
        } catch (_error) {
          sendJson(response, 500, { error: "Settings file is invalid JSON." });
        }
      });
      return;
    }

    if (request.method === "POST") {
      let body = "";

      request.on("data", (chunk) => {
        body += chunk;
      });

      request.on("end", () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          fs.writeFile(SETTINGS_FILE_PATH, `${JSON.stringify(parsedBody, null, 2)}\n`, "utf8", (error) => {
            if (error) {
              sendJson(response, 500, { error: "Failed to save settings." });
              return;
            }

            sendJson(response, 200, { ok: true });
          });
        } catch (_error) {
          sendJson(response, 400, { error: "Invalid JSON body." });
        }
      });

      return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (requestUrl.pathname === "/api/overview-append" && request.method === "POST") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        const entry = body ? JSON.parse(body) : null;
        if (!entry || typeof entry !== "object") {
          sendJson(response, 400, { error: "Invalid JSON body." });
          return;
        }
        fs.readFile(OVERVIEW_FILE_PATH, "utf8", (readErr, content) => {
          let doc = { version: 1, entries: [] };
          if (!readErr && content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed && Array.isArray(parsed.entries)) {
                doc = { version: typeof parsed.version === "number" ? parsed.version : 1, entries: parsed.entries };
              }
            } catch {
              doc = { version: 1, entries: [] };
            }
          }
          doc.entries.push(entry);
          if (doc.entries.length > OVERVIEW_MAX_ENTRIES) {
            doc.entries = doc.entries.slice(-OVERVIEW_MAX_ENTRIES);
          }
          fs.writeFile(OVERVIEW_FILE_PATH, `${JSON.stringify(doc, null, 2)}\n`, "utf8", (writeErr) => {
            if (writeErr) {
              sendJson(response, 500, { error: "Failed to write overview.json." });
              return;
            }
            sendJson(response, 200, { ok: true, count: doc.entries.length });
          });
        });
      } catch {
        sendJson(response, 400, { error: "Invalid JSON." });
      }
    });
    return;
  }

  if (requestUrl.pathname === "/api/notify" && request.method === "POST") {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      try {
        const { message, discordExtra } = body ? JSON.parse(body) : {};
        if (!message || typeof message !== "string") {
          sendJson(response, 400, { error: "message required" });
          return;
        }
        fs.readFile(SETTINGS_FILE_PATH, "utf8", (err, content) => {
          if (err || !content) {
            sendJson(response, 200, { ok: true });
            return;
          }
          try {
            const settings = JSON.parse(content);
            const https = require("https");

            const token = settings.telegramBotToken?.trim();
            const chatId = settings.telegramChatId?.trim();
            const discordWebhookUrl = settings.discordWebhookUrl?.trim();

            let pending = 0;
            const done = () => {
              pending--;
              if (pending <= 0) sendJson(response, 200, { ok: true });
            };

            if (token && chatId) {
              pending++;
              const url = `https://api.telegram.org/bot${token}/sendMessage`;
              const data = JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" });
              const req = https.request(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
              }, (res) => {
                let resp = "";
                res.on("data", (c) => { resp += c; });
                res.on("end", () => done());
              });
              req.on("error", () => done());
              req.write(data);
              req.end();
            }

            if (discordWebhookUrl && discordWebhookUrl.startsWith("https://discord.com/api/webhooks/")) {
              pending++;
              const discordMsg = message.replace(/<[^>]*>/g, "");
              const extra =
                typeof discordExtra === "string" && discordExtra.trim()
                  ? `\n${discordExtra.trim()}`
                  : "";
              const discordData = JSON.stringify({ content: discordMsg + extra });
              const req = https.request(discordWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(discordData) }
              }, (res) => {
                res.on("data", () => {});
                res.on("end", () => done());
              });
              req.on("error", () => done());
              req.write(discordData);
              req.end();
            }

            if (pending === 0) sendJson(response, 200, { ok: true });
          } catch {
            sendJson(response, 200, { ok: true });
          }
        });
      } catch {
        sendJson(response, 400, { error: "Invalid JSON" });
      }
    });
    return;
  }

  const safePath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT_DIR, safePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (stats.isDirectory()) {
      sendFile(path.join(filePath, "index.html"), response);
      return;
    }

    sendFile(filePath, response);
  });
});

server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  if (USE_NGROK) {
    try {
      const ngrok = require("ngrok");
      const url = await ngrok.connect({ addr: PORT });
      console.log(`\n  ngrok tunnel: ${url}`);
      console.log("  Truy cập từ thiết bị khác qua URL trên.\n");
    } catch (err) {
      console.error("ngrok error:", err.message);
      console.log("  Chạy: npm install ngrok");
    }
  }
});
