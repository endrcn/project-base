const mongoose = require("mongoose");

const schema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    is_active: { type: mongoose.Schema.Types.Boolean, default: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId }
}, {
    versionKey: false
});


class Categories extends mongoose.Model {

}

schema.loadClass(Categories);
module.exports = mongoose.model("categories", schema, "categories");