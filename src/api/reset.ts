import type { Request, Response } from "express";
import { config } from "../config";

export async function handlerReset(_: Request, res: Response) {
  config.api.fileServerHits = 0;
  res.write("Hits reset to 0");
  res.end();
}