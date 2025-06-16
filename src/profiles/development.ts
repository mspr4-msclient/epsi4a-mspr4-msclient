module.exports = {
    PORT: 8080,
    CLIENT_URL: "http://localhost:8080",
    RABBITMQ_URL:"amqp://rabbitmq",
    LOGSTASH_URL:"http://logstash:5044",
    ELASTICSEARCH_URL:process.env.ELASTICSEARCH_URL,
    CLIENT_MONGO_CONNECTION_STRING: process.env.CLIENT_MONGO_CONNECTION_STRING,
    PROMETHEUS_EXPORTER_URL:"http://localhost:9464/metrics"
};