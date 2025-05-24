import winston from 'winston';
import Transport from 'winston-transport';
import axios from 'axios';

class LogstashHttpTransport extends Transport {
  constructor(opts: any) {
    super(opts);
  }

  async log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    try {
      const logstashUrl = process.env.LOGSTASH_URL || 'http://logstash:5044';
      await axios.post(logstashUrl, info, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Erreur envoi log à Logstash:", (error as any).message);
    }

    callback();
  }
}

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    service: "client-service",
    ...metadata
  });
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new LogstashHttpTransport({})
  ],
});

export default logger;
