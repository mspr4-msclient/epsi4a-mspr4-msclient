import { context, propagation, trace, Span } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';

export function tracesMiddleware(req: Request, res: Response, next: NextFunction) {

  if (req.originalUrl.startsWith('/metrics')) {
    return next();
  }

  const tracer = trace.getTracer('client');
  const incomingContext = propagation.extract(context.active(), req.headers);
  const currentSpan = trace.getSpan(context.active());

  if (currentSpan) {
    return next();
  }

  context.with(incomingContext, () => {
    const span: Span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
      attributes: {
        'http.method': req.method,
        'http.url': req.originalUrl,
        'http.route': req.route?.path ?? req.path,
      },
    });

    const spanContext = trace.setSpan(context.active(), span);

    context.with(spanContext, () => {
      res.on('finish', () => {
        span.setAttribute('http.status_code', res.statusCode);
        span.end();
      });

      next();
    });
  });
}
