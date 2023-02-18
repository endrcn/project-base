const mongoose = require("mongoose");

const schema = mongoose.Schema({
    role_name: { type: String, required: true },
    description: { type: String },
    is_active: { type: mongoose.Schema.Types.Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId }
}, {
    versionKey: false,
    timestamps: true
});

schema.index({ role_name: 1 }, { unique: true });

class Roles extends mongoose.Model {

}

schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema, "roles");