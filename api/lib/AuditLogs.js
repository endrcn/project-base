const AuditLogsModel = require("../db/models/AuditLogs");

class AuditLogs {
    constructor() {
        if (!AuditLogs.instance) {
            AuditLogs.instance = this;
        }

        return AuditLogs.instance;
    }

    info(email, location, proc_type, log) {
        this.#saveToDB({
            level: "INFO",
            email,
            location,
            proc_type,
            log
        })
    }

    error(email, location, proc_type, log) {
        this.saveToDB({
            level: "ERROR",
            email,
            location,
            proc_type,
            log
        })
    }

    warn(email, location, proc_type, log) {
        this.saveToDB({
            level: "WARNING",
            email,
            location,
            proc_type,
            log
        })
    }

    #saveToDB({ level, email, location, proc_type, log }) {
        let auditLog = new AuditLogsModel({
            level,
            email,
            location,
            proc_type,
            log
        });

        auditLog.save();
    }
}

module.exports = new AuditLogs();