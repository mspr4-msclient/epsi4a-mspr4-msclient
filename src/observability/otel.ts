import opentelemetry, { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { Request, Response } from 'express';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';


let requestCounter: any;
let requestDuration: any;
let responseCounter: any;
let tracer: any;
let sdk: NodeSDK;
let httpInstrumentation: HttpInstrumentation;
let prometheusExporter: PrometheusExporter;

export function Observability(config: any) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  prometheusExporter = new PrometheusExporter(
    { preventServerStart: true }
  );

  const meterProvider = new MeterProvider({
    readers: [prometheusExporter],
  });

  const meter = meterProvider.getMeter('client');

  requestCounter = meter.createCounter('http_request_count_total', {
    description: 'Nombre total de requêtes HTTP',
  });

  responseCounter = meter.createCounter('http_response_count_total', {
    description: 'Nombre total de réponses HTTP',
  });

  requestDuration = meter.createHistogram('response_time_ms', {
    description: 'Temps de réponse des requêtes HTTP',
  });

  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'client',
      [ATTR_SERVICE_VERSION]: '0.7',
    }),
  );

  const exporter = new OTLPTraceExporter({
    url: config.OLTP_TRACE_EXPORTER_URL
  });

  tracer = opentelemetry.trace.getTracer('client', '0.7');

  sdk = new NodeSDK({
    resource,
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (request) => request.url === '/metrics',
          ignoreOutgoingRequestHook: (request) => request.hostname === config.LOGSTASH_URL,
        },
      }),
    ],
  });
}

export function getObservabilityMetrics() {
  return {
    requestCounter,
    requestDuration,
    responseCounter
  };
}

export const metricsHandler = (req: Request, res: Response) => {
  prometheusExporter.getMetricsRequestHandler(req as any, res as any);
};

export function getTracer() {
  return tracer;
}

export function getSdk() {
  return sdk;
}
