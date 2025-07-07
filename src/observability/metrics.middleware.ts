import { Request, Response } from "express";

export const metricsMiddleware = (requestCounter: any, requestDuration: any, responseCounter: any) =>
    (req: Request, res: Response, next: any) => {

    if (req.path === '/metrics') {
      return next();
    }

    const start = process.hrtime();

    res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    const labels = {
      method: req.method,
      route: req.originalUrl.split('?')[0],
      status_code: res.statusCode.toString(),
      env: process.env.NODE_ENV,
    };

    requestCounter.add(1, labels);
    requestDuration.record(duration, labels);

    responseCounter.add(1, {
      ...labels,
      status_code: res.statusCode.toString(),
    });
  });

  next();
}