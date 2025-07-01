import { context, propagation, trace } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';


export function tracesMiddleware(req: Request, res: Response, next: NextFunction) {
  const ctx = propagation.extract(context.active(), req.headers);

  context.with(ctx, () => {
    trace.getSpan(context.active());
    next();
  });
}
