import { Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import logger from "../loggers/logger";
import os from "os";
import path from "path";


export function authorize(allowedScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {

    let responseSent = false;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      responseSent = true;
      logger.error("Unauthorized access attempt");
      return res.status(401).send("Unauthorized");
    }

    if (!authHeader.startsWith("Bearer ")) {
      responseSent = true;
      logger.error("Unauthorized access attempt");
      return res.status(401).send("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    const platform = os.platform();
    let verifierPath: string;

    if (platform === "win32") {
      verifierPath = path.resolve(__dirname, "../auth/middleware/win-token-verifier.exe");
    } else {
      verifierPath = path.resolve(__dirname, "../auth/middleware/token-verifier");
    }

    const verifier = spawn(verifierPath, [authHeader]);

    verifier.on("close", (code) => {
      if (responseSent) return;
      if (code !== 0) {
        responseSent = true;
        logger.error(`Token verification failed with code ${code}`);
        return res.status(401).send("Unauthorized: invalid token");
      }

      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        const scopes: string[] = payload.scope?.split(" ") ?? [];

        const hasScope = allowedScopes.some(scope => scopes.includes(scope));
        if (!hasScope) {
          responseSent = true;
          logger.error(`Forbidden access attempt: insufficient scope. Required: ${allowedScopes.join(", ")}, Provided: ${scopes.join(", ")}`);
          return res.status(403).send("Forbidden: insufficient scope");
        }

        next();
      } catch (e) {
        responseSent = true;
        logger.error("Malformed token", e);
        return res.status(400).send("Malformed token");
      }
    });

    verifier.on("error", (err) => {
      if (responseSent) return;
      console.error("Failed to run verifier:", err);
      responseSent = true;
      logger.error("Failed to run token verifier", err);
      return res.status(500).send("Internal Server Error");
    });
  };
}
