const logger = require("../logger/logger");
//Singleton
let instance = null;
/**
 * @class
 */
class Logger {

    constructor() {
        if (!instance) {
            this.logger = logger
            instance = this;
        }
        return instance;

    }

    createLogObject(userId, location, procType, log) {
        return {
            userId,
            location,
            procType,
            log,
            processId: process.pid
        };
    }

    /**
     * Prints Info Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async info(userId, location, procType, log) {
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.info(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async error(userId, location, procType, log) {
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.error(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async warn(userId, location, procType, log) {
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.warn(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async http(userId, location, procType, log) {
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.http(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async verbose(userId, location, procType, log) {
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.verbose(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async debug(userId, location, procType, log) {
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.debug(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async silly(userId, location, procType, log) {
        log = await this.handleLog(log, userId)
        let logs = this.createLogObject(userId, location, procType, log)
        this.logger.silly(logs);
    }





}

module.exports = new Logger();