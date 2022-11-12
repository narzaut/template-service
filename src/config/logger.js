const winston = require('winston');
const config = require('./config');

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});
const logger = winston.createLogger({
    level: ['development'].includes(config.env) ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        ['development', 'test'].includes(config.env)
            ? winston.format.colorize()
            : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf(({ level, message }) => `${level}: ${message}`)
    ),
    defaultMeta: { service: 'template-service' },
    transports: [
        new winston.transports.File({
            filename: 'template.error.log',
            level: 'error'
        }),
        new winston.transports.Console({
            stderrLevels: ['error']
        })
    ]
});

module.exports = logger;
