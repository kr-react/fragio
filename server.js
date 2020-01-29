const http = require("http");
const http2 = require("http2");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

const PUBLIC_PATH = "./public";
const DIST_PATH = "./dist";

class FileManager {
  constructor(config) {
    this.files = [];

    for (const dir of config.dirs) {
      const paths = fs.readdirSync(dir, {
        withFileTypes: true
      });

      for (const dirent of paths) {
        if (!dirent.isFile()) continue;

        const filepath = `${dir}/${dirent.name}`;

        // TODO: Find better way to get mimetype and encoding
        exec(`mimetype ${filepath} | awk '{print $2}'`, (err, out) => {
          let mimetype = out.substr(0, out.length - 1);
          let encoding = "identity";

          if (filepath.endsWith(".gz")) {
            encoding = "gzip";
          } else if (filepath.endsWith(".br")) {
            encoding = "br";
          }

          if (encoding != "identity") {
            if (filepath.includes(".js")) {
              mimetype = "application/javascript";
            }
          }

          fs.watch(filepath, () => {
            this.find(filepath).content = Buffer.from(fs.readFileSync(filepath));
          });

          this.files.push({
            path: filepath,
            content: Buffer.from(fs.readFileSync(filepath)),
            encoding,
            mimetype
          });
        });
      }
    }
  }

  find(path) {
    return this.files.find(f => f.path == path);
  }

  remove(path) {
    return this.files.filter(f => f.path != path);
  }
}

function isDistPath(path) {
  return path.startsWith("/%DIST_URL%");
}

function isPublicPath(path) {
  return path.startsWith("/%PUBLIC_URL%");
}

function onRequest(request, response, fileManager) {
  const url = request.url;
  const encodings = request.headers["accept-encoding"] || "";
  let path = `${PUBLIC_PATH}/index.html`;

  if (isDistPath(url)) {
    path = url.replace("/%DIST_URL%", DIST_PATH);
  } else if (isPublicPath(url)) {
    path = url.replace("/%PUBLIC_URL%", PUBLIC_PATH);
  } else if (url === "/robots.txt") {
    path = "./public/robots.txt";
  }

  let file = fileManager.find(path);

  if (encodings.includes("br")) {
    file = fileManager.find(path + ".br") || file;
  } else if (encodings.includes("gzip")) {
    file = fileManager.find(path + ".gz") || file;
  }

  if (file) {
    response.writeHead(200, {
      "Content-Type": file.mimetype,
      "Content-Encoding": file.encoding,
      "Cache-Control": "must-revalidate, public, 604800"
    });
    response.end(file.content, "utf-8");
  } else {
    response.writeHead(404);
    response.end("No such file or directory", "utf-8");
  }
}

const HTTP_PORT = parseInt(process.env.PORT);
const HTTPS_PORT = HTTP_PORT + 1;

const HTTP_HOST = `http://localhost:${HTTP_PORT}`;
const HTTPS_HOST = `https://localhost:${HTTPS_PORT}`;

const server = http2.createSecureServer({
  key: fs.readFileSync(process.env.SSL_KEY, "utf-8"),
  cert: fs.readFileSync(process.env.SSL_CERT, "utf-8"),
});

const fileManager = new FileManager({
  dirs: [PUBLIC_PATH, DIST_PATH, DIST_PATH + "/modules"]
});

server.on("error", (err) => console.error(err));
server.on("request", (req, res) => onRequest(req, res, fileManager));
server.listen(HTTPS_PORT);

http.createServer((request, response) => {
  const host = request.headers.host.replace(`:${HTTP_PORT}`, `:${HTTPS_PORT}`);
  response.writeHead(301, { "Location": `https://${host}${request.url}` });
  response.end();
}).listen(HTTP_PORT);

console.log(`Server running at ${HTTP_HOST}/ ${HTTPS_HOST}/`);
