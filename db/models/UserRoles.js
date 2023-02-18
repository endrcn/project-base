const mongoose = require("mongoose");

const schema = mongoose.Schema({
    role_id: { type: mongoose.Schema.Types.ObjectId },
    user_id: { type: mongoose.Schema.Types.ObjectId },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId }
}, {
    versionKey: false,
    timestamps: true
});

schema.index({ role_id: 1, user_id: 1 }, { unique: true });

class UserRoles extends mongoose.Model {

}

schema.loadClass(UserRoles);
module.exports = mongoose.model("user_roles", schema, "user_roles");