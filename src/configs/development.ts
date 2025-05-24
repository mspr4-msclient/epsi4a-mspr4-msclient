module.exports = {
    PORT: 8080,
    BASE_URL: "http://localhost",
    RABBITMQ_URL:"amqp://rabbitmq",
    LOGSTASH_URL:"http://logstash",
    ELASTICSEARCH_URL:process.env.ELASTICSEARCH_URL,
    CLIENT_MONGO_CONNECTION_STRING: process.env.CLIENT_MONGO_CONNECTION_STRING,
};