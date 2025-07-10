import amqp from 'amqplib/callback_api';
import { config } from '../app';


const RABBITMQ_URL = config.RABBITMQ_URL;

export async function publishMessage(msg: unknown, exchangeName: string, exchangeType: string): Promise<void> {
  try {
    amqp.connect(RABBITMQ_URL, function(error0, connection) {
      if (error0) { throw error0; }
      connection.createChannel(function(error1, channel) {
        if (error1) { throw error1; }
        channel.assertExchange(exchangeName, exchangeType, {durable: true})
        channel.publish(exchangeName, exchangeType, Buffer.from(JSON.stringify(msg)));
      });
    });
  } catch (error) {
    throw new Error(`Failed to publish message: ${(error as Error).message}`);
  }
}
