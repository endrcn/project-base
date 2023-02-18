const mongoose = require("mongoose");

const schema = mongoose.Schema({
    role_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    permission: { type: String, required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
    versionKey: false,
    timestamps: true
});

schema.index({ role_id: 1, permission: 1 }, { unique: true });

class RolePrivileges extends mongoose.Model {

}

schema.loadClass(RolePrivileges);
module.exports = mongoose.model("role_privileges", schema, "role_privileges");