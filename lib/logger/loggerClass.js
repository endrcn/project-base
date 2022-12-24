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

    createLogDict(userId, client, location, procType, log) {
        return {
            userId,
            client,
            location,
            procType,
            log,
            processId: process.pid
        };
    }

    /**
     * Prints Info Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async info(userId, client, location, procType, log) {
        //input = input ? JSON.parse(JSON.stringify(input)) : {};
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.info(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async error(userId, client, location, procType, log) {
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.error(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async warn(userId, client, location, procType, log) {
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.warn(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async http(userId, client, location, procType, log) {
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.http(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async verbose(userId, client, location, procType, log) {
        log = await this.handleLog(log, userId)
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.verbose(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async debug(userId, client, location, procType, log) {
        log = await this.handleLog(log, userId)
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.debug(logs);
    }

    /**
     * Prints Error Log
     * @param {String} userId User's ID
     * @param {String} client Bot Name
     * @param {String} location Where the log is written
     * @param {String} procType The process where the log is written
     * @param {any} log Log details
     */
    async silly(userId, client, location, procType, log) {
        log = await this.handleLog(log, userId)
        let logs = this.createLogDict(userId, client, location, procType, log)
        this.logger.silly(logs);
    }





}

module.exports = new Logger();