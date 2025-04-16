import type { Request, Response, NextFunction } from "express";

export function middlewareLogResponse(req: Request, res: Response, next: NextFunction): void{
    res.on("finish", () =>{
        const statusCode: number = res.statusCode;
        if (statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    })
    next();
}