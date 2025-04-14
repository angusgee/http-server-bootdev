import express from "express";
import config from "./config.js";
const app = express();
const PORT = 8080;
const MAXCHARS = 140;
app.use(middlewareLogResponses);
app.use(middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(express.json());
const server = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
server.on('error', (error) => {
    console.error('Server error:', error);
});
app.get("/api/healthz", handleReadiness);
app.post("/admin/reset", resetMiddlewareCount);
app.get("/admin/metrics", returnMiddlewareMetrics);
app.post("/api/validate_chirp", validateChirp);
// return 200 in plain text for server health check
function handleReadiness(req, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send('OK');
}
// log all non-200 responses: npm run dev | tee server.log
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
// increment count of hits to all endpoints apart from /metrics
function middlewareMetricsInc(req, res, next) {
    if (req.path !== '/admin/metrics') {
        config.fileserverHits++;
    }
    next();
}
function returnMiddlewareMetrics(req, res) {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`\ 
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileserverHits} times!</p>
            </body>
        </html>
    `);
}
function resetMiddlewareCount(req, res) {
    config.fileserverHits = 0;
    res.status(200).send('OK');
}
// ensure message is not more than 140 chars
function validateChirp(req, res) {
    const messageBody = req.body;
    // remove bad words
    const words = messageBody.body.split(" ").map(word => {
        if (word.toLowerCase().includes("kerfuffle") ||
            word.toLowerCase().includes("sharbert") ||
            word.toLowerCase().includes("fornax")) {
            return "****";
        }
        return word;
    });
    const cleanedMessage = words.join(" ");
    if (cleanedMessage.length > MAXCHARS) {
        const chirpTooLongRes = {
            "error": "Chirp is too long"
        };
        res.status(400).json(chirpTooLongRes);
    }
    else {
        const successResponse = {
            "cleanedBody": cleanedMessage
        };
        res.status(200).json(successResponse);
    }
}
