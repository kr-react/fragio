const http = require("http");
const http2 = require("http2");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

const PUBLIC_PATH = "./public";
const DIST_PATH = "./dist";

function log(level, message) {
  const now = new Date(Date.now());
  console.log(`[${now.toLocaleString()}] [${level}] ${message}`);
}

function isDistPath(path) {
  return path.startsWith("/%DIST_URL%");
}

function isPublicPath(path) {
  return path.startsWith("/%PUBLIC_URL%");
}

function onRequest(request, response) {
  const url = request.url;
  log("INFO", `Request at '${url}'`);

  let path = `${PUBLIC_PATH}/index.html`;
  let contentType = "text/html";

  if (isDistPath(url)) {
    path = url.replace("/%DIST_URL%", DIST_PATH);
    contentType = "text/javascript";
  } else if (isPublicPath(url)) {
    path = url.replace("/%PUBLIC_URL%", PUBLIC_PATH);
    switch (path.split(".").slice(-1)[0]) {
      case "html":
        contentType = "text/html";
        break;

      case "json":
        contentType = "application/json";
        break;

      case "txt":
        contentType = "text/plain";
        break;

      case "js":
        contentType = "text/javascript";
        break;

      default:
        contentType = "*/*";
        break;
    }
  } else if (url === "/robots.txt") {
    path = "./public/robots.txt";
  }

  fs.readFile(path, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        response.writeHead(404);
        response.end("No such file or directory", "utf-8");
      }
    } else {
      response.writeHead(200, {
        "Content-Type": contentType,
        "Content-Encoding": path.endsWith(".gz") ? "gzip" : "identity",
        "Cache-Control": "must-revalidate, public, 604800"
      });
      response.end(content, "utf-8");
    }
  });
}

const HTTP_PORT = parseInt(process.env.PORT);
const HTTPS_PORT = HTTP_PORT + 1;

const HTTP_HOST = `http://localhost:${HTTP_PORT}`;
const HTTPS_HOST = `https://localhost:${HTTPS_PORT}`;

const server = http2.createSecureServer({
  key: fs.readFileSync(process.env.SSL_KEY, "utf-8"),
  cert: fs.readFileSync(process.env.SSL_CERT, "utf-8"),
});

server.on("error", (err) => console.error(err));
server.on("request", onRequest);
server.listen(HTTPS_PORT);

http.createServer((request, response) => {
  const host = request.headers.host.replace(`:${HTTP_PORT}`, `:${HTTPS_PORT}`);
  response.writeHead(301, { "Location": `https://${host}${request.url}` });
  response.end();
  log("INFO", "Redirect to HTTP/2");
}).listen(HTTP_PORT);

if (process.argv.includes("--browser")) {
  switch (process.platform) {
    case "win32":
      exec(`cmd /c start ${HTTPS_HOST}`);
      break;

    case "darwin":
      exec(`open ${HTTPS_HOST}`);

    case "linux":
      exec(`xdg-open ${HTTPS_HOST}`);
      break;
  }
}

console.log(`Server running at ${HTTP_HOST}/ ${HTTPS_HOST}/`);
