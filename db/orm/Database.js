
let instance = null;

class Database {
    constructor(dbType) {
        if (!instance) instance = this;
        this.db = require("./" + dbType);
        return instance;
    }

    async connect(options) {
        await this.db.connect(options);
    }
}

module.exports = Database;