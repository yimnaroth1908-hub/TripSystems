
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_FOLDER = __dirname;
const DATA_FOLDER = path.join(__dirname, "data");
const SUBMISSIONS_FILE = path.join(DATA_FOLDER, "submissions.json");
const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp"
};

// Create data folder and JSON file if they do not exist.
fs.mkdirSync(DATA_FOLDER, { recursive: true });

if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, "[]", "utf8");
}

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data));
}

function readSubmissions() {
    const content = fs.readFileSync(SUBMISSIONS_FILE, "utf8");
    const data = JSON.parse(content || "[]");

    if (!Array.isArray(data)) {
        throw new Error("submissions.json must contain an array");
    }

    return data;
}

function handleAPI(req, res, pathname) {
    // Get all submissions for the Admin Dashboard.
    if (pathname === "/api/submissions" && req.method === "GET") {
        try {
            return sendJSON(res, 200, {
                success: true,
                submissions: readSubmissions()
            });
        } catch (error) {
            console.error("Read submissions error:", error);
            return sendJSON(res, 500, {
                success: false,
                message: "Cannot read submissions."
            });
        }
    }

    // Save a new form submission.
    if (pathname === "/api/submissions" && req.method === "POST") {
        let body = "";
        let finished = false;

        req.on("data", (chunk) => {
            if (finished) return;

            body += chunk.toString("utf8");

            if (Buffer.byteLength(body, "utf8") > MAX_BODY_SIZE) {
                finished = true;
                sendJSON(res, 413, {
                    success: false,
                    message: "Submission is too large."
                });
                req.destroy();
            }
        });

        req.on("end", () => {
            if (finished) return;

            try {
                const submission = JSON.parse(body);

                if (
                    !submission ||
                    typeof submission !== "object" ||
                    Array.isArray(submission)
                ) {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "Invalid submission data."
                    });
                }

                const submissions = readSubmissions();

                const newSubmission = {
                    ...submission,
                    id: `${Date.now()}-${Math.random()
                        .toString(36).slice(2, 8)}`,
                    submittedAt: new Date().toISOString()
                };

                submissions.push(newSubmission);

                fs.writeFileSync(
                    SUBMISSIONS_FILE,
                    JSON.stringify(submissions, null, 2),
                    "utf8"
                );

                return sendJSON(res, 201, {
                    success: true,
                    message: "Submission saved successfully.",
                    submission: newSubmission
                });
            } catch (error) {
                console.error("Save submission error:", error);

                return sendJSON(res, 400, {
                    success: false,
                    message: "Invalid JSON or unable to save submission."
                });
            }
        });

        req.on("error", (error) => {
            console.error("Request error:", error);

            if (!res.headersSent && !res.destroyed) {
                sendJSON(res, 400, {
                    success: false,
                    message: "Request failed."
                });
            }
        });

        return;
    }

    if (pathname.startsWith("/api/")) {
        return sendJSON(res, 404, {
            success: false,
            message: "API endpoint not found."
        });
    }

    return false;
}

const server = http.createServer((req, res) => {
    let pathname;

    try {
        pathname = decodeURIComponent(
            new URL(
                req.url,
                `http://${req.headers.host || "localhost"}`
            ).pathname
        );
    } catch (error) {
        return sendJSON(res, 400, {
            success: false,
            message: "Bad Request."
        });
    }

    // Handle API requests first.
    if (pathname.startsWith("/api/")) {
        if (req.method !== "GET" && req.method !== "POST") {
            res.setHeader("Allow", "GET, POST");
            return sendJSON(res, 405, {
                success: false,
                message: "Method Not Allowed."
            });
        }

        return handleAPI(req, res, pathname);
    }

    // Static website files only support GET and HEAD.
    if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, {
            "Content-Type": "text/plain; charset=utf-8",
            "Allow": "GET, HEAD"
        });
        return res.end("Method Not Allowed");
    }

    if (pathname === "/") {
        pathname = "/index.html";
    }

    // Do not expose stored submissions as a public JSON file.
    if (
        pathname === "/data" ||
        pathname.startsWith("/data/") ||
        pathname === "/server.js"
    ) {
        res.writeHead(403, {
            "Content-Type": "text/plain; charset=utf-8"
        });
        return res.end("Forbidden");
    }

    const requestedFile = path.resolve(
        PUBLIC_FOLDER,
        "." + pathname
    );

    const relativePath = path.relative(
        PUBLIC_FOLDER,
        requestedFile
    );

    if (
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath)
    ) {
        res.writeHead(403, {
            "Content-Type": "text/plain; charset=utf-8"
        });
        return res.end("Forbidden");
    }

    fs.stat(requestedFile, (statError, stats) => {
        if (statError || !stats.isFile()) {
            res.writeHead(404, {
                "Content-Type": "text/plain; charset=utf-8"
            });
            return res.end("404 - File Not Found");
        }

        const extension = path.extname(requestedFile).toLowerCase();
        const contentType =
            MIME_TYPES[extension] || "application/octet-stream";

        res.writeHead(200, {
            "Content-Type": contentType,
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-cache"
        });

        if (req.method === "HEAD") {
            return res.end();
        }

        const stream = fs.createReadStream(requestedFile);

        stream.on("error", () => {
            if (!res.headersSent) {
                res.writeHead(500, {
                    "Content-Type": "text/plain; charset=utf-8"
                });
            }
            res.end("Internal Server Error");
        });

        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log("---------------------------------------");
    console.log("  KOMPOT TRIP PLAN");
    console.log("---------------------------------------");
    console.log(`Website: http://localhost:${PORT}`);
    console.log(`Submissions API: http://localhost:${PORT}/api/submissions`);
    console.log("Press Ctrl + C to stop the server.");
});
