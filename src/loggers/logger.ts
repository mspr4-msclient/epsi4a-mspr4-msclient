import winston from 'winston';
import Transport from 'winston-transport';
import axios from 'axios';
import { config } from '../app';


class LogstashHttpTransport extends Transport {
  constructor(opts: any) {
    super(opts);
  }

  async log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    try {
      const logstashUrl = config.LOGSTASH_URL;

      const enrichedLog = {
        timestamp: new Date().toISOString(),
        level: info.level,
        message: info.message,
        "Properties.Version": "0.4",
        "Properties.Service": "Client",
        ...info
      };

      await axios.post(logstashUrl, enrichedLog, {
        headers: { 'Content-Type': 'application/json' },
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
    "Properties.Version": "0.4",
    "Properties.Service": "client",
    ...metadata
  });
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      customFormat
    )
  })
];

if (process.env.NODE_ENV !== 'test') {
  transports.push(new LogstashHttpTransport({}));
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp()
  ),
  transports
});

export default logger;
