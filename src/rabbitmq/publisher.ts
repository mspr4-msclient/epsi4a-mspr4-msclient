import amqp from 'amqplib/callback_api';


const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq';

export async function publishMessage(msg: unknown, exchangeName: string, exchangeType: string): Promise<void> {
  try {
    amqp.connect(RABBITMQ_URL, function(error0, connection) {
      if (error0) { throw error0; }
      connection.createChannel(function(error1, channel) {
        if (error1) { throw error1; }
        channel.assertExchange(exchangeName, exchangeType, {durable: false})
        channel.publish(exchangeName, exchangeType, Buffer.from(JSON.stringify(msg)));
        console.log(" [x] Sent %s", JSON.stringify(msg));
      });
    });
  } catch (error) {
    console.error('Publisher error:', error);
  }
}
