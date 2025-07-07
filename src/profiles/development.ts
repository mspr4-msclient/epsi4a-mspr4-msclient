module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: 8080,
    CLIENT_URL: "http://localhost",
    RABBITMQ_URL:"amqp://rabbitmq",
    LOGSTASH_URL:"http://logstash:5044",
    ELASTICSEARCH_URL:process.env.ELASTICSEARCH_URL,
    CLIENT_MONGO_CONNECTION_STRING: process.env.CLIENT_MONGO_CONNECTION_STRING,
    PROMETHEUS_EXPORTER_URL:"http://localhost:8080/metrics",
    OLTP_TRACE_EXPORTER_URL: "http://jaeger:4318/v1/traces"
};