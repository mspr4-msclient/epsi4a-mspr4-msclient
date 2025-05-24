import { Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import path from "path";

export function authorize(allowedScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    const verifierPath = process.platform === "win32"
      ? "./middleware/token-verifier.exe"
      : "/app/dist/middleware/token-verifier";

    const verifier = spawn(verifierPath, [authHeader]);

    verifier.on("close", (code) => {
      if (code !== 0) {
        return res.status(401).send("Unauthorized: invalid token");
      }

      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        const scopes: string[] = payload.scope?.split(" ") || [];

        const hasScope = allowedScopes.some(scope => scopes.includes(scope));
        if (!hasScope) {
          return res.status(403).send("Forbidden: insufficient scope");
        }

        next();
      } catch (e) {
        return res.status(400).send("Malformed token");
      }
    });

    verifier.on("error", (err) => {
      console.error("Failed to run verifier:", err);
      return res.status(500).send("Internal Server Error");
    });
  };
}
