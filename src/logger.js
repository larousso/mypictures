import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'

const logger = new (winston.Logger);

let transports;
if(__SERVER__) {
    if(__DEVELOPMENT__) {
        transports = [
            new (winston.transports.Console)(),
            new (DailyRotateFile)({ filename: `${__LOGPATH__}/application.log` })
        ];
        logger.configure({
            level: 'debug',
            transports: transports
        });
    } else {
        transports = [
            new (DailyRotateFile)({ filename: `${__LOGPATH__}/application.log` })
        ];
        logger.configure({
            level: 'info',
            transports: transports
        });
    }
} else {
    transports = [
        new (winston.transports.Console)()
    ];
    logger.configure({
        level: 'info',
        transports: transports
    });
}
export {
    transports,
    winston
}
export default logger;
