const mongoose = require("mongoose");

const schema = mongoose.Schema({
    level: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    proc_type: { type: String, required: true },
    log: { type: String }
}, {
    versionKey: false,
    timestamps: true
});

class AuditLogs extends mongoose.Model {

}

schema.loadClass(AuditLogs);
module.exports = mongoose.model("auditlogs", schema, "auditlogs");