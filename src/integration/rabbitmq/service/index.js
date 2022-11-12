const amqplib = require('amqplib');
const httpStatus = require('http-status');
const EventEmitter = require('events');
const { v4: uuidvv4 } = require('uuid');

const startConsumers = requireFromRoot('integration/rabbitmq//queues');
const withTimeout = requireFromRoot('utils/timeout');
const logger = requireFromRoot('config/logger');
const ApiError = requireFromRoot('utils/ApiError');

const RPCService = module.exports;
const TIMEOUT_MS = 5000;
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
const PREFETCH_COUNT = 0;
let { channel, err } = { undefined };

const initialize = async () => {
    try {
        const connection = await amqplib.connect(process.env.RABBITMQ);
        channel = await connection.createChannel();
        channel.responseEmitter = new EventEmitter();
        channel.responseEmitter.setMaxListeners(0);
        channel.consume(
            REPLY_QUEUE,
            (msg) => {
                channel.responseEmitter.emit(
                    msg.properties.correlationId,
                    JSON.parse(msg.content.toString('utf8'))
                );
            },
            { noAck: true }
        );
        return { channel };
    } catch (error) {
        logger.error(error);
        return { err: error };
    }
};

RPCService.getStatus = async () => {
    try {
        await amqplib.connect(process.env.RABBITMQ);
        return true;
    } catch (error) {
        logger.debug(error);
        return false;
    }
};

RPCService.replyToQueue = async (queue, data) => {
    if (!channel) ({ channel, err } = await initialize());
    if (err) return err;
    channel.sendToQueue(queue.replyTo, Buffer.from(JSON.stringify(data)), {
        correlationId: queue.id
    });
};

RPCService.publishToQueue = async (queueName, data) => {
    try {
        if (!channel) ({ channel, err } = await initialize(queueName));
        if (err) return err;

        const sendRPC = () => {
            return new Promise((resolve) => {
                const correlationId = uuidvv4();
                channel.responseEmitter.once(correlationId, resolve);
                channel.sendToQueue(
                    queueName,
                    Buffer.from(JSON.stringify(data)),
                    {
                        correlationId,
                        replyTo: REPLY_QUEUE,
                        persistent: false
                    }
                );
            });
        };
        return await withTimeout(TIMEOUT_MS, sendRPC());
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

RPCService.consumeToQueue = async (queueName, cb) => {
    if (!channel) {
        ({ channel, err } = await initialize(queueName));
        if (err) return err;
        channel.assertQueue(queueName, { durable: false });
        logger.info(`RabbitMQ: ${queueName} queue initialized `);
    }

    channel.prefetch(PREFETCH_COUNT);
    channel.consume(
        queueName,
        (msg) => {
            const content = msg.content.toString();

            try {
                const obj = JSON.parse(content);

                cb(obj, {
                    name: queueName,
                    replyTo: msg.properties.replyTo,
                    id: msg.properties.correlationId
                });
            } catch (error) {
                logger.error(error);
                logger.debug(content);
            }
        },
        { noAck: true }
    );
};

RPCService.startConsumers = () => startConsumers();

RPCService.closeChannel = async () => {
    await channel?.close();
    logger.error(`Closing rabbitmq channel`);
};

process.on('exit', async (code) => {
    await RPCService.closeChannel();
    logger.error(`Closing rabbitmq channel`);
});
