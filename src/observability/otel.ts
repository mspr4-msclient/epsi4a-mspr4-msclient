import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { config } from '../app';


diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const prometheusExporter = new PrometheusExporter(
  { port: 3013, endpoint: '/metrics' },
  () => console.log(`✅ Prometheus exporter sur ${config.PROMETHEUS_EXPORTER_URL}`)
);

const meterProvider = new MeterProvider({
  readers: [prometheusExporter],
});

const meter = meterProvider.getMeter('clients');

export const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Nombre total de requêtes HTTP',
});

export const errorCounter = meter.createCounter('http_errors_total', {
  description: 'Nombre total de requêtes HTTP en erreur',
});

export const requestDuration = meter.createHistogram('http_response_time', {
  description: 'Temps de réponse des requêtes HTTP',
});