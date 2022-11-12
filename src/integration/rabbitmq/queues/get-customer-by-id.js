const httpStatus = require('http-status');

const RPCService = requireFromRoot('integration/rabbitmq/service');
const customerService = requireFromRoot('services/customer');
const logger = requireFromRoot('config/logger');

const getCustomerById = () => {
    RPCService.consumeToQueue(
        'get-customer-by-id',
        async (jsonMessage, queue) => {
            const { uid, query } = jsonMessage;
            try {
                const user = await customerService.getCustomerById(uid, query);
                if (!user)
                    return RPCService.replyToQueue(queue, {
                        status: httpStatus.NOT_FOUND,
                        details: 'Customer Not Found'
                    });
                return RPCService.replyToQueue(queue, {
                    status: httpStatus.OK,
                    data: user
                });
            } catch (err) {
                logger.debug(err);
                return RPCService.replyToQueue(queue, {
                    status: httpStatus.INTERNAL_SERVER_ERROR,
                    details: 'there was an error attempting to fetch customer'
                });
            }
        }
    );
};

module.exports = getCustomerById;
