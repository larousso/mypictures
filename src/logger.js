import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'

const logger = new (winston.Logger);

if(__SERVER__) {
    logger.add(DailyRotateFile, { filename: `${__LOGPATH__}/application.log` });
    //logger.add(winston.transports.File, { filename: `${__LOGPATH__}/application.log` });
    if(__DEVELOPMENT__) {
        winston.level = 'debug';
        logger.add(winston.transports.Console);
    } else {
        winston.level = 'info';
        //logger.add(winston.transports.Console);
    }
} else {
    logger.add(winston.transports.Console);
    if(__DEVELOPMENT__) {
        winston.level = 'debug';
    } else {
        winston.level = 'info';
    }
}
export {
    winston
}
export default logger;
