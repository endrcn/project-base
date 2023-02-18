const mongoose = require("mongoose");

const schema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    level: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    proc_type: { type: String, required: true },
    log: { type: String },
}, {
    versionKey: false
});

class AuditLogs extends mongoose.Model {

}

schema.loadClass(AuditLogs);
module.exports = mongoose.model("auditlogs", AuditLogs, "auditlogs");