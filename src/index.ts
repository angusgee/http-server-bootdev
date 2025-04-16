import express, { NextFunction, Request, Response } from "express";
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
app.use(errorHandler);

// return 200 in plain text for server health check
function handleReadiness(req: Request, res: Response): void {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send('OK');
}

//////////////// Error handling ///////////////////////////

// handle 400
class BadRequestError extends Error {
    status: number
    constructor(message: string){
        super(message);
        this.status = 400;
        this.name = "BadRequestError";
    }
}

// handle 401
class UnauthorizedError extends Error {
    constructor(message: string){
        super(message);
    }
}

// handle 403
class ForbiddenError extends Error {
    constructor(message: string){
        super(message);
    }
}

// handle 404
class NotFoundError extends Error {
    constructor(message: string){
        super(message);
    }
}

function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (err instanceof BadRequestError) {
        res.status(err.status).json({error: err.message});
    } else {
        console.error(err);
        res.status(500);
    }
}

//////////////// End error handling ///////////////////////////


// log all non-200 responses: npm run dev | tee server.log
function middlewareLogResponses(req: Request, res: Response, next: NextFunction): void{
    res.on("finish", () =>{
        const statusCode: number = res.statusCode;
        if (statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    })
    next();
}

// increment count of hits to all endpoints apart from /metrics
function middlewareMetricsInc(req: Request, res: Response, next: NextFunction): void {
    if (req.path !== '/admin/metrics') {
        config.fileserverHits++;
    }
    next();
}

function returnMiddlewareMetrics(req: Request, res: Response): void {
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

function resetMiddlewareCount(req: Request, res: Response): void {
    config.fileserverHits = 0;
    res.status(200).send('OK');
}

function validateChirp(
    req: Request,
    res: Response, 
    next: NextFunction)
    : void {

    try {
        type chirpMessage = {
            body: string
        }
        
        const messageBody: chirpMessage = req.body;

        // remove bad words
        const words = messageBody.body.split(" ").map(word => {
            if (word.toLowerCase().includes("kerfuffle") ||
                word.toLowerCase().includes("sharbert") ||
                word.toLowerCase().includes("fornax")) {
                return "****";
            }
            return word;
        })

        const cleanedMessage = words.join(" ");

        // ensure message is not more than 140 chars
        if (cleanedMessage.length > MAXCHARS) {
            throw new BadRequestError("Chirp is too long. Max length is 140");
        } else {
            const successResponse = {
                "cleanedBody": cleanedMessage
                }
            res.status(200).json(successResponse);
        }      
        
    } catch (err) {
        next(err);
}}
