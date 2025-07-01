module.exports = {
    PORT: 8080,
    CLIENT_URL: "https://mspr4-cloud-run-service-321153931988.us-central1.run.app",
    RABBITMQ_URL:"amqp://34.28.175.116",
    LOGSTASH_URL:"http://34.28.175.116:5044",
    // ELASTICSEARCH_URL:process.env.ELASTICSEARCH_URL,
    // CLIENT_MONGO_CONNECTION_STRING: process.env.CLIENT_MONGO_CONNECTION_STRING,
    PROMETHEUS_EXPORTER_URL:"https://mspr4-cloud-run-service-321153931988.us-central1.run.app/metrics",
    OLTP_TRACE_EXPORTER_URL: 'http://34.28.175.116:4318/v1/traces'
};