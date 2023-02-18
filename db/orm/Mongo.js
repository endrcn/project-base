
/**
 * MongoDB methods are in this class
 * This class is created with Singleton Pattern!
 */

const mongoose = require("mongoose");
const logger = require("../../lib/logger/loggerClass");
mongoose.Promise = Promise;

let instance = null;

class Mongo {
    constructor() {
        if (!instance) {
            this.mongoConnection = null;
            instance = this;
        }
        return instance;
    }

    async connect(options) {
        try {
            console.log("MongoDB Connecting!");
            let db = await mongoose.connect(options.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

            this.mongoConnection = db;
            logger.info("-", "Mongo", "connect", "MongoDB Connection Established!");
        } catch (err) {
            logger.error("-", "Mongo", "connect", err);
        }
    }

}


module.exports = new Mongo();